---
title: Catalog Service Spec
status: draft
owner: catalog-team
last_updated: 2025-01-08
---

# Catalog Service

## 1. Overview
- Purpose: manage products, categories, variants, and attributes.
- Primary consumers: Commerce service, UI, Admin users.
- Data ownership: catalog domain only.

## 2. Responsibilities
- CRUD for products, categories, variants, attributes.
- Search, filter, sort, and pagination.
- Media management (image upload + URLs).
- Admin workflows (create/edit/publish).

## 3. Non-Responsibilities
- Payments, orders, or inventory reservations.
- User authentication (handled by Auth service).

## 4. Tech Decisions
- Framework: Django + Django REST Framework (sync).
- ORM: Django ORM.
- DB: MySQL (shared instance, new schema).
- Cache: Redis.
- Media storage: S3-compatible (MinIO local, S3 prod).
- API contract: OpenAPI + `/v1` versioning.
- Auth: JWT from Auth service; RBAC (admin/editor/viewer).

## 5. Data Model (Draft)
- product(id, seller_id, name, slug, description, status, created_at, updated_at)
- category(id, name, slug, parent_id, created_at, updated_at)
- product_variant(id, product_id, sku, price, status)
- attribute(id, name)
- product_attribute(id, product_id, attribute_id, value)
- product_image(id, product_id, url, position)

## 6. API Endpoints (Draft)
- `POST /v1/products`
- `GET /v1/products`
- `GET /v1/products/{id}`
- `PATCH /v1/products/{id}`
- `DELETE /v1/products/{id}`
- `POST /v1/categories`
- `GET /v1/categories`
- `GET /v1/categories/{id}`
- `POST /v1/products/{id}/images`

## 7. Search and Filtering
- Initial: MySQL indexes + basic full-text on product name/description.
- Upgrade path: Meilisearch/Elasticsearch for faceted search and relevance.

## 8. Caching
- Product detail cache by `product_id` (TTL 5-15 min).
- Category tree cache (TTL 30-60 min).
- Invalidate on write.

## 9. Admin Workflow
- Create product -> add variants -> upload images -> publish.
- Draft/published status.

## 10. Security and Permissions
- Admin: full CRUD.
- Editor: create/update, no delete.
- Viewer: read-only.
- Seller scope: `seller_id` ties products to Auth service users with role `seller`.

## 11. Observability
- JSON logs with `request_id` and `user_id`.
- Metrics: request count, p95 latency, cache hit rate.

## 12. Open Questions
- Inventory linkage: direct ownership vs read from Commerce.
- Price history: needed or not.
- Localization: multi-language fields?
