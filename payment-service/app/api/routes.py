import hashlib
import hmac

import msgspec
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.routing import Route, Router

from app.api.errors import problem_detail
from app.core.config import settings
from app.db.session import SessionLocal
from app.schemas import (
    CreatePaymentRequest,
    PaymentResponse,
    PaymentView,
    RefundRequest,
    RefundResponse,
)
from app.services.payment import (
    apply_webhook,
    create_payment,
    get_payment_by_id,
    record_webhook,
    refund_payment,
)


def _decode_json(body: bytes, schema):
    try:
        return msgspec.json.decode(body, type=schema)
    except msgspec.ValidationError as exc:
        raise ValueError(str(exc)) from exc


def _verify_signature(body: bytes, signature: str | None):
    if not signature:
        return False
    secret = settings.payos_webhook_secret.encode("utf-8")
    digest = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)


async def create_payment_handler(request: Request):
    body = await request.body()
    try:
        payload = _decode_json(body, CreatePaymentRequest)
    except ValueError as exc:
        return problem_detail(400, "Invalid payload", str(exc), code="VALIDATION_ERROR")

    idempotency_key = request.headers.get("Idempotency-Key")

    async with SessionLocal() as session:
        try:
            payment = await create_payment(session, payload, idempotency_key)
            await session.commit()
        except ValueError:
            await session.rollback()
            return problem_detail(409, "Idempotency conflict", "Idempotency key conflict", code="IDEMPOTENCY_CONFLICT")
        except Exception as exc:
            await session.rollback()
            return problem_detail(502, "Provider error", str(exc), code="PROVIDER_ERROR")

    response = PaymentResponse(
        payment_id=payment.id,
        provider_ref=payment.provider_ref,
        status=payment.status.value,
        qr_url=payment.qr_url,
        checkout_url=payment.checkout_url,
        expires_at=payment.expires_at,
    )
    return Response(msgspec.json.encode(response), media_type="application/json")


async def get_payment_handler(request: Request):
    payment_id = request.path_params["payment_id"]
    async with SessionLocal() as session:
        payment = await get_payment_by_id(session, int(payment_id))
        if not payment:
            return problem_detail(404, "Not found", "Payment not found", code="NOT_FOUND")

    response = PaymentView(
        payment_id=payment.id,
        status=payment.status.value,
        amount=payment.amount,
        currency=payment.currency,
        order_id=payment.order_id,
        provider_ref=payment.provider_ref,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )
    return Response(msgspec.json.encode(response), media_type="application/json")


async def refund_payment_handler(request: Request):
    payment_id = request.path_params["payment_id"]
    body = await request.body()
    try:
        payload = _decode_json(body, RefundRequest)
    except ValueError as exc:
        return problem_detail(400, "Invalid payload", str(exc), code="VALIDATION_ERROR")

    idempotency_key = request.headers.get("Idempotency-Key")

    async with SessionLocal() as session:
        payment = await get_payment_by_id(session, int(payment_id))
        if not payment:
            return problem_detail(404, "Not found", "Payment not found", code="NOT_FOUND")
        try:
            refund = await refund_payment(session, payment, payload, idempotency_key)
            await session.commit()
        except RuntimeError:
            await session.rollback()
            return problem_detail(409, "Invalid state", "Payment not refundable", code="INVALID_STATE")
        except ValueError:
            await session.rollback()
            return problem_detail(409, "Idempotency conflict", "Idempotency key conflict", code="IDEMPOTENCY_CONFLICT")
        except Exception as exc:
            await session.rollback()
            return problem_detail(502, "Provider error", str(exc), code="PROVIDER_ERROR")

    response = RefundResponse(
        refund_id=refund.id,
        status=refund.status.value,
        refunded_amount=refund.amount,
        payment_id=refund.payment_id,
    )
    return Response(msgspec.json.encode(response), media_type="application/json")


async def webhook_handler(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Signature")
    if not _verify_signature(body, signature):
        return problem_detail(400, "Invalid signature", "Signature verification failed", code="INVALID_SIGNATURE")

    try:
        payload = msgspec.json.decode(body)
    except msgspec.ValidationError as exc:
        return problem_detail(400, "Invalid payload", str(exc), code="VALIDATION_ERROR")

    event_id = payload.get("event_id")
    if not event_id:
        return problem_detail(400, "Invalid payload", "event_id is required", code="VALIDATION_ERROR")

    async with SessionLocal() as session:
        try:
            await record_webhook(session, "payos", event_id, payload)
            await apply_webhook(session, payload)
            await session.commit()
        except Exception:
            await session.rollback()
            return problem_detail(500, "Webhook processing failed", "Unable to process webhook", code="WEBHOOK_ERROR")

    return Response(status_code=204)


async def health_handler(request: Request):
    return JSONResponse({"status": "ok"})


router = Router(
    routes=[
        Route(f"{settings.api_v1_prefix}/payments", create_payment_handler, methods=["POST"]),
        Route(f"{settings.api_v1_prefix}/payments/{{payment_id:int}}", get_payment_handler, methods=["GET"]),
        Route(
            f"{settings.api_v1_prefix}/payments/{{payment_id:int}}/refunds",
            refund_payment_handler,
            methods=["POST"],
        ),
        Route(f"{settings.api_v1_prefix}/webhooks/payos", webhook_handler, methods=["POST"]),
        Route(f"{settings.api_v1_prefix}/health", health_handler, methods=["GET"]),
    ]
)
