from datetime import datetime
from typing import Optional

import msgspec


class CreatePaymentRequest(msgspec.Struct):
    amount: int
    currency: str
    order_id: str
    customer_id: Optional[str] = None
    return_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class PaymentResponse(msgspec.Struct):
    payment_id: int
    provider_ref: Optional[str]
    status: str
    qr_url: Optional[str]
    checkout_url: Optional[str]
    expires_at: Optional[datetime]


class PaymentView(msgspec.Struct):
    payment_id: int
    status: str
    amount: int
    currency: str
    order_id: str
    provider_ref: Optional[str]
    created_at: datetime
    updated_at: datetime


class RefundRequest(msgspec.Struct):
    amount: Optional[int] = None
    reason: Optional[str] = None


class RefundResponse(msgspec.Struct):
    refund_id: int
    status: str
    refunded_amount: int
    payment_id: int


class PayOSWebhookEvent(msgspec.Struct):
    event_id: str
    event_type: str
    payment_id: int
    status: str
    amount: int
