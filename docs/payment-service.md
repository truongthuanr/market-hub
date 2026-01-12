# Payment Service

## Function Specs (Draft)
### Primary capabilities
- Create payment (QR/checkout) with idempotency and provider abstraction.
- Query payment status with consistent state mapping.
- Refund (full/partial) with idempotency and provider reconciliation.
- Webhook ingest and processing (verify -> idempotency -> outbox -> ack).
- Publish outbox events to Kafka for downstream services.
- Operational endpoints (health, readiness, metrics).

### Service-level functions
#### create_payment(input, idempotency_key) -> PaymentResponse
- Input: amount, currency, order_id, customer info, return_url, expires_at.
- Flow: validate -> idempotency lookup -> provider.create_payment -> persist payment
  + provider ref -> write outbox event -> return payment_id + qr/checkout url.
- Output: payment_id, provider_ref, status=pending, qr_url/checkout_url, expires_at.
- Errors: validation (4xx), idempotency conflict (409), provider timeout/5xx.

#### get_payment(payment_id) -> PaymentView
- Input: payment_id.
- Flow: read from DB -> map provider/status fields -> return view.
- Output: payment_id, status, amount, currency, order_id, provider_ref, timestamps.
- Errors: not found (404).

#### refund_payment(payment_id, refund_request, idempotency_key) -> RefundResponse
- Input: payment_id, amount(optional for partial), reason.
- Flow: validate state (paid) -> idempotency lookup -> provider.refund -> persist
  refund + update payment state -> outbox event.
- Output: refund_id, status, refunded_amount, payment_id.
- Errors: invalid state (409), validation (4xx), provider error (5xx).

#### handle_webhook(request) -> Ack
- Input: raw body + headers.
- Flow: verify signature -> parse provider event -> store webhook idempotency ->
  write outbox event -> ack 2xx.
- Output: 2xx response; no body or minimal ack.
- Errors: invalid signature (4xx), processing error (5xx, may retry).

#### consume_outbox_event(event) -> None
- Input: outbox event payload.
- Flow: deserialize -> update payment/refund state -> audit -> publish domain event
  -> mark outbox published.
- Errors: transient -> retry; permanent -> DLQ.

#### publish_domain_event(event) -> None
- Input: domain event.
- Flow: serialize -> send to Kafka with key=payment_id -> handle publish result.
- Errors: broker error -> retry/backoff.

#### reconcile_provider_status(payment_id) -> None
- Input: payment_id.
- Flow: call provider API -> compare state -> update if drift -> emit event.
- Errors: provider timeout/5xx -> retry/backoff.
