from decimal import Decimal

from pydantic import BaseModel


class CheckoutCreate(BaseModel):
    cart_id: int
    promo_code: str | None = None


class CheckoutOut(BaseModel):
    order_id: int
    total_amount: Decimal
    currency: str
