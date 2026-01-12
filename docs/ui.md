---
title: UI Service Spec
status: draft
owner: ui-team
last_updated: 2025-01-10
---

# UI Service

## 1. Overview
- Purpose: customer- and admin-facing web app for browsing, purchase, and account
  management.
- Primary consumers: end users, internal admins, support staff.
- Integrates with: Auth, Catalog, Commerce, Payment services.

## 2. Responsibilities
- Product discovery: search, category browse, PDP, recommendations.
- Commerce flows: cart, checkout, order history, order detail.
- Account flows: login, profile, addresses, payment methods (if supported).
- Admin surfaces: catalog management, order lookup, refunds (role-gated).

## 3. Non-Responsibilities
- Business logic for pricing, orders, or payments (owned by backend services).
- Auth token issuance or user identity management (Auth service).
- Data persistence for domain entities (backend services).

## 4. Tech Decisions
- Framework: Next.js (App Router) with React 18 + TypeScript.
- Rendering: default RSC + SSR; client components only when needed.
- Styling: Tailwind CSS with CSS variables.
- Component system: shadcn/ui (New York style) + lucide icons.
- API integration: server-side fetch to backend services.

## 5. Core Pages (Draft)
- Home: featured categories, promotions, search entry.
- Category listing: filters, sorting, pagination.
- Product detail: variants, images, reviews placeholder.
- Cart: line items, quantity updates, promo entry.
- Checkout: shipping, summary, payment initiation.
- Orders: list + detail, invoice, status tracking.
- Auth: login/register, password reset.
- Admin: product CRUD, order lookup/refund.

## 6. Route Mapping (Draft)
- `/` -> home, featured categories, promo modules.
- `/category/[slug]` -> category listing + filters.
- `/product/[slug]` -> product detail.
- `/cart` -> cart view + promo entry.
- `/checkout` -> checkout + payment initiation.
- `/orders` -> order list.
- `/orders/[id]` -> order detail + receipt.
- `/auth/login` -> login.
- `/auth/register` -> register.
- `/admin/products` -> product CRUD (admin only).
- `/admin/orders` -> order lookup/refund (admin/support).

## 7. Backend Service Integration
### 6.1 Auth service
- Session validation on server-rendered routes.
- Role-gated layouts for admin views.

### 6.2 Catalog service
- Product listing/search for home + category pages.
- Product detail and media assets.

### 6.3 Commerce service
- Cart CRUD and checkout initiation.
- Order list and order detail views.

### 6.4 Payment service
- Payment status polling/redirect return handling.
- Receipt and refund status views.

## 8. Data Fetching and Caching
- Use server components to fetch data with per-route caching rules.
- Revalidate catalog pages on publish/update events (manual revalidate hook).
- Client-side fetch only for interactive flows (cart edits, live search).

## 9. Error Handling
- Map RFC7807 Problem Details into user-friendly messages.
- Surface retry actions for transient 5xx or network errors.
- 401/403 -> redirect to login or show access denied.

## 10. Environment Variables (Draft)
- `NEXT_PUBLIC_AUTH_API_URL`
- `NEXT_PUBLIC_CATALOG_API_URL`
- `NEXT_PUBLIC_COMMERCE_API_URL`
- `NEXT_PUBLIC_PAYMENT_API_URL`

## 11. Observability
- Frontend logging with `request_id` correlation when present.
- Basic analytics events: product view, add-to-cart, checkout started, purchase.

## 12. Accessibility and Performance
- WCAG 2.1 AA targets for core flows.
- Image optimization via Next.js Image.
- Minimize client JS by limiting client components.
