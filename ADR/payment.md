## Context
Payment service will be asynchronous (API + ORM) and should support webhook-driven
updates from a QR payment provider. The project already has a MySQL instance and
uses a service-oriented architecture.

## Decision
Framework and data:
- Framework: Starlette (ASGI).
- Validation: msgspec.
- ORM: SQLAlchemy 2.0 async with `asyncmy` driver.
- Database: same MySQL instance, new schema.

Messaging:
- Message broker: Kafka.
- Webhook flow: verify -> store idempotency -> write outbox -> ack.
- Consumer: async handle (update state, audit, retry/DLQ).
- Reliability: transactional outbox to avoid lost events.

Provider abstraction:
- Define a `PaymentProvider` interface (create_payment, refund, parse_webhook).
- Implement `PayOSProvider` adapter; swap provider via config.

API contract:
- OpenAPI 3.1 is the source of truth; JSON Schema for request/response bodies.
- Versioning via `/v1` in path; only backward-compatible changes within a version.
- Idempotency: `Idempotency-Key` for create/refund endpoints.
- Error format: RFC7807 (Problem Details). No extra `{ data/error }` envelope.
- Webhook schema versioned by `event_version`; keep old versions for replay.

Observability:
- Logging: JSON with `request_id`, `trace_id`, `user_id`.
- Tracing: auto-instrumentation plus manual spans on main payment flows.
- Metrics: Prometheus + Grafana; traces/logs via Tempo/Loki.
- Alerts: 5xx rate, p95 latency, Kafka consumer lag, webhook DLQ rate.

Error handling:
- Error codes: PAYMENT_FAILED, INVALID_CARD, PROVIDER_TIMEOUT, etc.
- Status mapping: 4xx = client error (validation/auth/idempotency conflict),
  5xx = server/provider error.
- Retry: retry on timeout/5xx with exponential backoff + jitter; do not retry 4xx.
- Idempotency stored in DB to prevent double-charge.
- Circuit breaker + timeouts for provider calls.

Security:
- Provider: PayOS (QR-first, webhook support).
- PCI scope minimized by avoiding raw card data handling in service.
- Secrets management: environment variables now, migrate to vault/secret manager later.
- Tokenization handled by provider.

Minimal endpoints:
- `POST /v1/payments` create payment, return `payment_id` + `qr_url/checkout_url`.
- `GET /v1/payments/{id}` get status.
- `POST /v1/payments/{id}/refunds` refund.
- `POST /v1/webhooks/payos` webhook receiver.
- `GET /v1/health` healthcheck.

Payment state machine:
- `pending` -> `paid` | `failed` | `expired`
- `paid` -> `refunded` (partial or full)

Outbox schema (minimal):
- `outbox_events(id, topic, payload, status, created_at, published_at)`
- `webhook_events(id, provider, event_id, payload, status, received_at, processed_at)`

## Consequences
- Async stack + Kafka increases operational complexity but supports webhook-driven
  flows and higher throughput.
- RFC7807 improves interoperability, but clients must adapt to Problem Details.
- Outbox pattern adds DB writes, but prevents lost events when acknowledging webhooks.
- PayOS simplifies onboarding and QR flows, but introduces provider coupling.
