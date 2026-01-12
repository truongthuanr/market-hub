from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    sku: str | None = None
    qty: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: Decimal
    currency: str
    created_at: datetime
    items: list[OrderItemOut] = []

    model_config = {"from_attributes": True}
