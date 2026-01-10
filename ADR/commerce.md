## Context
Commerce service owns the transactional purchase flow: carts, checkout, orders,
and promotions. It must coordinate with Auth (identity), Catalog (product data),
and Payment (charge/refund) while keeping order creation consistent and
idempotent. The project already uses a shared MySQL instance and will run
Redis and Kafka as shared infrastructure containers.

## Decision
Framework and data:
- Framework: FastAPI (ASGI).
- Validation: Pydantic v2.
- ORM: SQLAlchemy 2.0 async with `asyncmy` driver.
- Database: same MySQL instance, new schema.
- Cache/session: Redis for carts and checkout sessions.
Infrastructure:
- Redis: shared container for carts and sessions.
- Kafka: KRaft mode (no ZooKeeper) for order events.

Workflow and reliability:
- Use idempotency keys on checkout/order creation.
- Use transactional outbox for order events (created, paid, canceled).
- Emit events to Kafka for downstream services (fulfillment, email, analytics).

API contract:
- OpenAPI 3.1 is the source of truth; versioning via `/v1`.
- Error format: RFC7807 (Problem Details), no custom envelope.

Auth and permissions:
- Use Auth service session cookie; roles: customer, admin, support.
- Scope carts/orders by `user_id`.

## Consequences
- Async stack improves throughput but increases operational complexity.
- Redis carts reduce DB load but require clear expiry/restore rules.
- Outbox + Kafka add reliability for downstream workflows at the cost of
  additional infrastructure and operational overhead.
