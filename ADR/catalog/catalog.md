## Context
Catalog service focuses on product data, categories, and search/filter. It should
support fast reads, admin-friendly CRUD, and integration with Auth service.
The project already has a shared MySQL instance and Redis available.

## Decision
Framework and data:
- Framework: Django + Django REST Framework (sync).
- Admin: Django Admin.
- ORM: Django ORM.
- Database: same MySQL instance, new schema.
- Cache: Redis (read-through for hot items; optional HTTP cache headers).

Media storage:
- Use S3-compatible object storage (MinIO locally, S3 in prod).
- Store only media URLs in MySQL.

Search and filter:
- Start with MySQL indexes + basic full-text (title, description).
- Add Meilisearch or Elasticsearch if faceted search or relevance tuning becomes
  a requirement.

API contract:
- OpenAPI as the source of truth; versioning via `/v1`.

Auth and permissions:
- Use Auth service tokens; role-based access (admin/editor).

## Consequences
- Django speeds up CRUD and admin work but is heavier than minimal frameworks.
- MySQL + Redis is sufficient for initial scale; dedicated search adds ops later.
- S3-compatible storage avoids storing binaries in the DB and scales better.
