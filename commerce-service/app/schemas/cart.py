from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    product_id: int
    sku: str | None = None
    qty: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class CartItemUpdate(BaseModel):
    qty: int = Field(gt=0)


class CartItemOut(BaseModel):
    id: int
    product_id: int
    sku: str | None = None
    qty: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class CartOut(BaseModel):
    id: int
    user_id: int
    status: str
    expires_at: datetime | None = None
    items: list[CartItemOut] = []

    model_config = {"from_attributes": True}
