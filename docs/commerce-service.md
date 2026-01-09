---
title: Commerce Service Spec
status: draft
owner: commerce-team
last_updated: 2025-01-08
---

# Commerce Service

## 1. Overview
- Purpose: manage cart, checkout, orders, and promotions.
- Primary consumers: UI, Admin users, Payment service, Catalog service.
- Data ownership: commerce domain only.
- Shared infra: Redis (carts/sessions) and Kafka (order events) as standalone
  containers.

## 2. Responsibilities
- Cart lifecycle (add/update/remove items, price refresh).
- Checkout flow (shipping, totals, promo application, idempotent order create).
- Order lifecycle (create, pay, cancel, return).
- Promotion/coupon validation and application.
- Emit order events for fulfillment and analytics.

## 3. Non-Responsibilities
- Product master data (Catalog service).
- User identity and authentication (Auth service).
- Payment processing (Payment service).

## 4. Tech Decisions
- Framework: FastAPI (ASGI).
- ORM: SQLAlchemy 2.0 async.
- DB: MySQL (shared instance, new schema).
- Cache/session: Redis (cart + checkout session).
- Messaging: Kafka KRaft (order events via outbox).
- API contract: OpenAPI + `/v1` versioning.
- Auth: session cookie from Auth service; RBAC (customer/admin/support).

## 5. Core Functions (Draft)
### 5.1 Cart
- Create cart per user (or guest token).
- Add/update/remove line items; validate product + price from Catalog.
- Persist to Redis (TTL) and snapshot to DB on checkout.

### 5.2 Checkout
- Calculate totals: subtotal, discounts, shipping, taxes.
- Apply promo codes and validate eligibility.
- Idempotent order creation with `Idempotency-Key`.
- Create payment intent via Payment service; store `payment_id`.

### 5.3 Order
- Order state machine: `draft -> placed -> paid -> fulfilled -> completed`
- Cancellation/return rules with time windows.
- Store immutable order snapshot (items, prices, promo applied).

### 5.4 Promo
- Promo types: code-based, auto-apply, cart-level, item-level.
- Validation: eligibility, usage limits, start/end date, min spend.
- Audit usage per order and per user.

## 6. Data Model (Draft)
- cart(id, user_id, status, expires_at, created_at)
- cart_item(id, cart_id, product_id, sku, qty, unit_price)
- checkout_session(id, cart_id, totals_json, promo_id, created_at)
- order(id, user_id, status, total_amount, currency, created_at)
- order_item(id, order_id, product_id, sku, qty, unit_price)
- promo(id, code, type, value, starts_at, ends_at, max_uses)
- promo_redemption(id, promo_id, user_id, order_id, redeemed_at)

## 7. API Endpoints (Draft)
- `POST /v1/carts`
- `GET /v1/carts/{id}`
- `POST /v1/carts/{id}/items`
- `PATCH /v1/carts/{id}/items/{item_id}`
- `DELETE /v1/carts/{id}/items/{item_id}`
- `POST /v1/checkouts`
- `GET /v1/orders`
- `GET /v1/orders/{id}`
- `POST /v1/orders/{id}/cancel`
- `POST /v1/promos/validate`

## 8. Suggested Additions
- Inventory reservation with timeout (prevent oversell).
- Shipping service integration and rate calculation.
- Tax calculation provider integration.
- Returns/RMA workflow and refund orchestration.
- Loyalty/points or store credit.

## 9. Observability
- JSON logs with `request_id`, `user_id`, `order_id`.
- Metrics: checkout conversion, promo success rate, order latency, failure rate.

## 10. Decisions (Confirmed)
- Guest flows are not supported; login required for cart, checkout, and orders.
- Price is locked when the order is created.
- Multi-warehouse/partial fulfillment is out of scope for now.
