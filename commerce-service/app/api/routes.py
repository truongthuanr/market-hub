from datetime import datetime, timedelta
from decimal import Decimal
import asyncio

from aiokafka import AIOKafkaProducer
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis

from app.core.config import settings
from app.db.models import (
    Cart,
    CartItem,
    CheckoutSession,
    Order,
    OrderItem,
    Promo,
    PromoRedemption,
)
from app.db.session import get_db, engine
from app.schemas import (
    CartItemCreate,
    CartItemUpdate,
    CartItemOut,
    CartOut,
    CheckoutCreate,
    CheckoutOut,
    OrderItemOut,
    OrderOut,
    PromoValidateIn,
    PromoValidateOut,
)

router = APIRouter()


def require_user(request: Request) -> tuple[int, str]:
    user_id = request.session.get("user_id")
    role = request.session.get("role", "customer")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return int(user_id), str(role)


async def fetch_cart_items(db: AsyncSession, cart_id: int) -> list[CartItemOut]:
    items = (await db.execute(select(CartItem).where(CartItem.cart_id == cart_id))).scalars().all()
    return [CartItemOut.model_validate(item) for item in items]


async def compute_cart_total(db: AsyncSession, cart_id: int) -> Decimal:
    result = await db.execute(
        select(func.coalesce(func.sum(CartItem.qty * CartItem.unit_price), 0)).where(
            CartItem.cart_id == cart_id
        )
    )
    return Decimal(str(result.scalar_one()))


@router.get("/health")
async def health():
    status_map: dict[str, str] = {"db": "unknown", "redis": "unknown", "kafka": "unknown"}

    async def check_db():
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        status_map["db"] = "up"

    async def check_redis():
        if not settings.redis_url:
            status_map["redis"] = "skipped"
            return
        client = redis.from_url(settings.redis_url, decode_responses=True)
        await client.ping()
        await client.close()
        status_map["redis"] = "up"

    async def check_kafka():
        if not settings.kafka_bootstrap_servers:
            status_map["kafka"] = "skipped"
            return
        producer = AIOKafkaProducer(bootstrap_servers=settings.kafka_bootstrap_servers)
        await producer.start()
        await producer.stop()
        status_map["kafka"] = "up"

    checks = [check_db(), check_redis(), check_kafka()]
    results = await asyncio.gather(*checks, return_exceptions=True)
    for result, key in zip(results, ["db", "redis", "kafka"]):
        if isinstance(result, Exception):
            status_map[key] = "down"

    overall = "ok" if all(value in ("up", "skipped") for value in status_map.values()) else "degraded"
    return {"status": overall, "dependencies": status_map}


@router.post("/carts", response_model=CartOut, status_code=status.HTTP_201_CREATED)
async def create_cart(request: Request, db: AsyncSession = Depends(get_db)):
    user_id, _role = require_user(request)
    existing = (
        await db.execute(
            select(Cart).where(Cart.user_id == user_id, Cart.status == "active").limit(1)
        )
    ).scalar_one_or_none()
    if existing:
        items = await fetch_cart_items(db, existing.id)
        return CartOut.model_validate(existing, update={"items": items})

    expires_at = datetime.utcnow() + timedelta(days=7)
    cart = Cart(user_id=user_id, status="active", expires_at=expires_at)
    db.add(cart)
    await db.commit()
    await db.refresh(cart)
    return CartOut.model_validate(cart, update={"items": []})


@router.get("/carts/{cart_id}", response_model=CartOut)
async def get_cart(cart_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user_id, _role = require_user(request)
    cart = (await db.execute(select(Cart).where(Cart.id == cart_id))).scalar_one_or_none()
    if not cart or cart.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")
    items = await fetch_cart_items(db, cart.id)
    return CartOut.model_validate(cart, update={"items": items})


@router.post("/carts/{cart_id}/items", response_model=CartItemOut, status_code=status.HTTP_201_CREATED)
async def add_cart_item(
    cart_id: int, item_in: CartItemCreate, request: Request, db: AsyncSession = Depends(get_db)
):
    user_id, _role = require_user(request)
    cart = (await db.execute(select(Cart).where(Cart.id == cart_id))).scalar_one_or_none()
    if not cart or cart.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    item = CartItem(
        cart_id=cart_id,
        product_id=item_in.product_id,
        sku=item_in.sku,
        qty=item_in.qty,
        unit_price=item_in.unit_price,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return CartItemOut.model_validate(item)


@router.patch("/carts/{cart_id}/items/{item_id}", response_model=CartItemOut)
async def update_cart_item(
    cart_id: int,
    item_id: int,
    item_in: CartItemUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id, _role = require_user(request)
    cart = (await db.execute(select(Cart).where(Cart.id == cart_id))).scalar_one_or_none()
    if not cart or cart.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    item = (
        await db.execute(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart_id))
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    item.qty = item_in.qty
    await db.commit()
    await db.refresh(item)
    return CartItemOut.model_validate(item)


@router.delete("/carts/{cart_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart_item(
    cart_id: int, item_id: int, request: Request, db: AsyncSession = Depends(get_db)
):
    user_id, _role = require_user(request)
    cart = (await db.execute(select(Cart).where(Cart.id == cart_id))).scalar_one_or_none()
    if not cart or cart.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    item = (
        await db.execute(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart_id))
    ).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    await db.delete(item)
    await db.commit()


@router.post("/checkouts", response_model=CheckoutOut, status_code=status.HTTP_201_CREATED)
async def create_checkout(
    checkout_in: CheckoutCreate, request: Request, db: AsyncSession = Depends(get_db)
):
    user_id, _role = require_user(request)
    cart = (
        await db.execute(select(Cart).where(Cart.id == checkout_in.cart_id))
    ).scalar_one_or_none()
    if not cart or cart.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    idempotency_key = request.headers.get("Idempotency-Key")
    if idempotency_key:
        existing = (
            await db.execute(
                select(CheckoutSession).where(CheckoutSession.idempotency_key == idempotency_key)
            )
        ).scalar_one_or_none()
        if existing and existing.order_id:
            order = (
                await db.execute(select(Order).where(Order.id == existing.order_id))
            ).scalar_one_or_none()
            if order:
                return CheckoutOut(
                    order_id=order.id, total_amount=order.total_amount, currency=order.currency
                )

    items = (await db.execute(select(CartItem).where(CartItem.cart_id == cart.id))).scalars().all()
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    total = await compute_cart_total(db, cart.id)
    order = Order(user_id=user_id, status="placed", total_amount=total, currency=settings.default_currency)
    db.add(order)
    await db.flush()

    for item in items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                sku=item.sku,
                qty=item.qty,
                unit_price=item.unit_price,
            )
        )

    totals_json = {
        "subtotal": str(total),
        "discount": "0",
        "shipping": "0",
        "tax": "0",
        "total": str(total),
    }
    checkout_session = CheckoutSession(
        cart_id=cart.id,
        order_id=order.id,
        idempotency_key=idempotency_key,
        totals_json=totals_json,
    )
    db.add(checkout_session)
    await db.commit()
    await db.refresh(order)
    return CheckoutOut(order_id=order.id, total_amount=order.total_amount, currency=order.currency)


@router.get("/orders", response_model=list[OrderOut])
async def list_orders(request: Request, db: AsyncSession = Depends(get_db)):
    user_id, _role = require_user(request)
    orders = (await db.execute(select(Order).where(Order.user_id == user_id))).scalars().all()
    results: list[OrderOut] = []
    for order in orders:
        items = (
            await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        ).scalars().all()
        results.append(
            OrderOut.model_validate(order, update={"items": [OrderItemOut.model_validate(i) for i in items]})
        )
    return results


@router.get("/orders/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user_id, _role = require_user(request)
    order = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not order or order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    items = (await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))).scalars().all()
    return OrderOut.model_validate(order, update={"items": [OrderItemOut.model_validate(i) for i in items]})


@router.post("/orders/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(order_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user_id, _role = require_user(request)
    order = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not order or order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status in {"paid", "fulfilled", "completed"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order cannot be canceled")

    order.status = "canceled"
    await db.commit()
    await db.refresh(order)
    items = (await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))).scalars().all()
    return OrderOut.model_validate(order, update={"items": [OrderItemOut.model_validate(i) for i in items]})


@router.post("/promos/validate", response_model=PromoValidateOut)
async def validate_promo(
    promo_in: PromoValidateIn, request: Request, db: AsyncSession = Depends(get_db)
):
    user_id, _role = require_user(request)
    code = promo_in.code.strip().upper()
    promo = (await db.execute(select(Promo).where(Promo.code == code))).scalar_one_or_none()
    if not promo:
        return PromoValidateOut(valid=False, reason="PROMO_NOT_FOUND")

    now = datetime.utcnow()
    if promo.starts_at and now < promo.starts_at:
        return PromoValidateOut(valid=False, reason="PROMO_NOT_STARTED")
    if promo.ends_at and now > promo.ends_at:
        return PromoValidateOut(valid=False, reason="PROMO_EXPIRED")
    if promo.max_uses is not None:
        count = (
            await db.execute(
                select(func.count(PromoRedemption.id)).where(PromoRedemption.promo_id == promo.id)
            )
        ).scalar_one()
        if count >= promo.max_uses:
            return PromoValidateOut(valid=False, reason="PROMO_EXHAUSTED")

    _ = user_id
    return PromoValidateOut(valid=True)
