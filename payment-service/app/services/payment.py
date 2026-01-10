from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Payment, PaymentStatus, Refund, RefundStatus, IdempotencyKey, WebhookEvent
from app.services.outbox import create_outbox_event
from app.services.provider import PayOSProvider, PaymentProvider


def get_provider() -> PaymentProvider:
    return PayOSProvider()


async def get_payment_by_id(session: AsyncSession, payment_id: int) -> Payment | None:
    result = await session.execute(select(Payment).where(Payment.id == payment_id))
    return result.scalar_one_or_none()


async def get_idempotency(session: AsyncSession, key: str) -> IdempotencyKey | None:
    result = await session.execute(select(IdempotencyKey).where(IdempotencyKey.key == key))
    return result.scalar_one_or_none()


async def create_payment(session: AsyncSession, payload, idempotency_key: str | None):
    if idempotency_key:
        existing = await get_idempotency(session, idempotency_key)
        if existing and existing.resource_type != "payment":
            raise ValueError("Idempotency key conflict")
        if existing:
            payment = await get_payment_by_id(session, existing.resource_id)
            return payment

    provider = get_provider()
    provider_result = await provider.create_payment(payload.amount, payload.currency, payload.order_id)

    payment = Payment(
        order_id=payload.order_id,
        amount=payload.amount,
        currency=payload.currency,
        status=PaymentStatus.pending,
        provider="payos",
        provider_ref=provider_result.provider_ref,
        qr_url=provider_result.qr_url,
        checkout_url=provider_result.checkout_url,
        expires_at=provider_result.expires_at,
    )
    session.add(payment)
    await session.flush()

    if idempotency_key:
        session.add(
            IdempotencyKey(
                key=idempotency_key,
                resource_type="payment",
                resource_id=payment.id,
            )
        )

    await create_outbox_event(
        session,
        topic="payment.events",
        payload={
            "event_type": "payment_created",
            "payment_id": payment.id,
            "status": payment.status.value,
            "order_id": payment.order_id,
            "amount": payment.amount,
            "currency": payment.currency,
        },
    )

    return payment


async def refund_payment(session: AsyncSession, payment: Payment, refund_request, idempotency_key: str | None):
    if payment.status != PaymentStatus.paid:
        raise RuntimeError("Payment not paid")

    refund_amount = refund_request.amount or payment.amount

    if idempotency_key:
        existing = await get_idempotency(session, idempotency_key)
        if existing and existing.resource_type != "refund":
            raise ValueError("Idempotency key conflict")
        if existing:
            refund = await session.get(Refund, existing.resource_id)
            return refund

    provider = get_provider()
    refund_result = await provider.refund(payment.provider_ref or "", refund_amount)

    refund = Refund(
        payment_id=payment.id,
        amount=refund_amount,
        reason=refund_request.reason,
        status=RefundStatus.succeeded,
        provider_ref=refund_result.provider_ref,
    )
    session.add(refund)
    payment.status = PaymentStatus.refunded
    await session.flush()

    if idempotency_key:
        session.add(
            IdempotencyKey(
                key=idempotency_key,
                resource_type="refund",
                resource_id=refund.id,
            )
        )

    await create_outbox_event(
        session,
        topic="payment.events",
        payload={
            "event_type": "payment_refunded",
            "payment_id": payment.id,
            "refund_id": refund.id,
            "amount": refund.amount,
            "currency": payment.currency,
        },
    )

    return refund


async def record_webhook(session: AsyncSession, provider: str, event_id: str, payload: dict):
    result = await session.execute(select(WebhookEvent).where(WebhookEvent.event_id == event_id))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    webhook = WebhookEvent(provider=provider, event_id=event_id, payload=payload)
    session.add(webhook)
    await session.flush()
    return webhook


async def apply_webhook(session: AsyncSession, payload: dict):
    payment_id = payload.get("payment_id")
    status = payload.get("status")
    payment = await get_payment_by_id(session, int(payment_id)) if payment_id else None
    if not payment:
        return None

    if status in {"paid", "failed", "expired"}:
        payment.status = PaymentStatus(status)
        await create_outbox_event(
            session,
            topic="payment.events",
            payload={
                "event_type": "payment_status_updated",
                "payment_id": payment.id,
                "status": payment.status.value,
            },
        )
    return payment


async def reconcile_provider_status(session: AsyncSession, payment: Payment):
    payment.updated_at = datetime.utcnow()
    await create_outbox_event(
        session,
        topic="payment.events",
        payload={
            "event_type": "payment_reconciled",
            "payment_id": payment.id,
            "status": payment.status.value,
        },
    )
