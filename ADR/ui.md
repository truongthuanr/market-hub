## Context
The UI service is the customer- and admin-facing web application for the
marketplace. It needs strong SEO for product discovery, fast page loads, and
consistent auth/session handling across services. The repo already includes a
Next.js app with Tailwind and shadcn/ui configuration, so the ADR should align
with the existing implementation.

## Decision
Framework and rendering:
- Framework: Next.js (App Router) with React 18 and TypeScript.
- Rendering: default to SSR/RSC with server-side data fetching; opt into client
  components only when interactivity requires it.
- Routing: file-based routes in `src/app`, layouts for shared chrome.

UI system:
- Styling: Tailwind CSS with CSS variables.
- Component system: shadcn/ui (New York style) + lucide icons, using shadcn
  as the primary source for shared UI primitives and patterns.

Data and integration:
- Service integration via HTTP calls to Auth, Catalog, Commerce, and Payment
  APIs; base URLs configured via environment variables.
- Error handling surfaces RFC7807 Problem Details to the UI with user-friendly
  messaging and retry affordances where appropriate.

Auth:
- Use Auth service session cookies/tokens; protect authenticated routes with
  server-side checks and redirect to login when required.

## Consequences
- SSR/RSC improves performance and SEO but requires careful data fetching and
  caching strategy.
- Client components are limited to interactive views, reducing bundle size but
  requiring clear boundaries between server and client code.
- Next.js and Tailwind speed up UI delivery but add build-time tooling and
  conventions the team must follow.
