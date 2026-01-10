from dataclasses import dataclass
from datetime import datetime, timedelta
import uuid


@dataclass
class ProviderPaymentResult:
    provider_ref: str
    qr_url: str | None
    checkout_url: str | None
    expires_at: datetime | None


@dataclass
class ProviderRefundResult:
    provider_ref: str
    status: str


class PaymentProvider:
    async def create_payment(self, amount: int, currency: str, order_id: str):
        raise NotImplementedError

    async def refund(self, provider_ref: str, amount: int):
        raise NotImplementedError

    async def parse_webhook(self, payload: dict):
        raise NotImplementedError


class PayOSProvider(PaymentProvider):
    async def create_payment(self, amount: int, currency: str, order_id: str):
        provider_ref = f"payos_{uuid.uuid4().hex}"
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        return ProviderPaymentResult(
            provider_ref=provider_ref,
            qr_url=f"https://payos.local/qr/{provider_ref}",
            checkout_url=f"https://payos.local/checkout/{provider_ref}",
            expires_at=expires_at,
        )

    async def refund(self, provider_ref: str, amount: int):
        refund_ref = f"refund_{uuid.uuid4().hex}"
        return ProviderRefundResult(provider_ref=refund_ref, status="succeeded")

    async def parse_webhook(self, payload: dict):
        return payload
