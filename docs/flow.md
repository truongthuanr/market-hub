---
title: Flow Specs
status: draft
owner: platform-team
last_updated: 2025-01-10
---

# Flow Specs (UI + Backend)

This document captures end-to-end flows across UI and backend services. It is
implementation-oriented so frontend and backend stay aligned.

## 1. Auth Flow (Register, Login, Session)
Goal: users can register, sign in, and maintain session across services.

UI steps
- Register: submit email + password + role.
- Login: submit email + password.
- Session check: on app load, call auth `/auth/me`.
- Logout: call auth `/auth/logout`.

Backend calls
- `POST /auth/register` (Auth)
  - Body: `{ email, password, role }`
  - Response: user object
- `POST /auth/login` (Auth)
  - Body: `{ email, password }`
  - Response: user object; sets session cookie
- `GET /auth/me` (Auth)
  - Requires session cookie; returns user object
- `POST /auth/logout` (Auth)
  - Clears session cookie

Edge cases
- Invalid credentials -> 401; UI shows message.
- Session expired -> 401; UI treats as guest.

---

## 2. Search + Browse Flow (Catalog)
Goal: users can browse categories and find products by keyword.

UI steps
- Home: show featured categories + search input.
- Category page: list products for category slug.
- Search: filter by keyword (client-side or API support).
- Product detail: show variants and images.

Backend calls
- `GET /v1/categories/` (Catalog)
- `GET /v1/products/` (Catalog)
  - Current: list all products with pagination.
  - Future: add server-side filtering by query params.
- `GET /v1/products/{id}/` (Catalog)
  - Returns product + variants + images.

Edge cases
- Category slug not found -> 404; show empty state.
- No products -> show empty state + CTA to browse.

---

## 3. Cart Flow
Goal: users can manage cart items before checkout.

UI steps
- Create or get active cart.
- Add item to cart from product detail.
- Update item quantity or remove.
- Show cart summary.

Backend calls
- `POST /v1/carts` (Commerce)
  - Creates or returns active cart for current user (session required).
- `POST /v1/carts/{cart_id}/items` (Commerce)
  - Body: `{ product_id, sku, qty, unit_price }`
- `PATCH /v1/carts/{cart_id}/items/{item_id}` (Commerce)
  - Body: `{ qty }`
- `DELETE /v1/carts/{cart_id}/items/{item_id}` (Commerce)

Edge cases
- Not authenticated -> 401; redirect to login.
- Cart not found -> 404; show error + retry.
- Invalid qty -> 400; show validation message.

---

## 4. Checkout + Payment Flow
Goal: convert cart into an order and initiate payment.

UI steps
- On checkout page, request a checkout session.
- Create payment intent with order ID.
- Redirect to checkout URL or show QR URL.
- After payment, return to order detail page.

Backend calls
- `POST /v1/checkouts` (Commerce)
  - Headers: `Idempotency-Key`
  - Body: `{ cart_id }`
  - Response: `{ order_id, total_amount, currency }`
- `POST /v1/payments` (Payment)
  - Headers: `Idempotency-Key`
  - Body: `{ amount, currency, order_id, return_url }`
  - Response: `{ payment_id, status, qr_url, checkout_url, expires_at }`

Edge cases
- Cart empty -> 400; UI shows "cart empty".
- Idempotency conflict -> 409; UI retries with new key.
- Payment provider error -> 502; UI shows retry.

---

## 5. Orders Flow
Goal: users can view orders and order details.

UI steps
- Orders list: show total + status.
- Order detail: show items, status, total.

Backend calls
- `GET /v1/orders` (Commerce)
  - Response: list of orders with items.
- `GET /v1/orders/{order_id}` (Commerce)
  - Response: order + items.

Edge cases
- Not authenticated -> 401; redirect to login.
- Order not found -> 404; show error state.

---

## 6. Order Cancellation Flow (Optional)
Goal: allow cancellation when status allows.

UI steps
- From order detail, call cancel.
- Update status and refresh.

Backend calls
- `POST /v1/orders/{order_id}/cancel` (Commerce)
  - Response: updated order.

Edge cases
- Invalid state -> 400; show message.

---

## 7. Admin Flow (Placeholder)
Goal: manage catalog and orders (admin/support roles).

UI steps
- Admin pages are role-gated.
- CRUD products and view orders.

Backend calls
- Catalog admin endpoints (Django admin or API).
- Commerce order list/detail.

Notes
- Add role checks when admin endpoints are ready.
