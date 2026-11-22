# PizzaHub — Client (Next.js)

Frontend for **PizzaHub**, a role-based pizza ordering & delivery platform. Customers browse and order, vendors manage menus/orders and subscribe to Premium, admins moderate the platform.

- **Live site:** `https://your-site.vercel.app`  _(add after deploy)_
- **Client repo:** `https://github.com/<you>/pizzahub-client`
- **Server repo:** `https://github.com/<you>/pizzahub-server`
- **Admin login:** `admin@pizzahub.com` / `Admin1234`  _(created by `npm run seed` in the server)_

## Important features
- Better Auth (email + password, Google), role selection at sign-up, admin role assigned only server-side
- Role-based dashboards (Customer / Vendor / Admin) with sidebar, stat cards and charts; wrong-role URLs are redirected, and the API enforces roles again
- Home: animated hero, featured items (Premium first), categories, Why Choose PizzaHub, How It Works
- Browse menu: search, category/location/price filters, price sorting, pagination, loading + empty states
- Item details: gallery, vendor info, order dialog (date, address, notes), favorites, reviews & ratings
- Order flow with a **Pay now button placeholder** (no Stripe for food orders — Stripe is only for vendor subscriptions)
- Vendor: add/edit/delete items with ImgBB uploads, availability toggle, accept/reject orders, Stripe Premium subscription (cancel/resume)
- Admin: block/unblock users, approve/reject/delete items, read-only transactions
- Dark / light mode, order status timeline, toast notifications, custom 404 + error pages, fully responsive

## Tech stack (npm packages)
`next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `tailwindcss-animate`, `better-auth`, `mongodb`, `framer-motion`, `@tanstack/react-query`, `next-themes`, `sonner`, `recharts`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, Radix UI (`@radix-ui/react-dialog`, `-dropdown-menu`, `-avatar`, `-label`, `-slot`) for ShadCN-style components

## Installation & run locally
```bash
npm install
cp .env.example .env     # fill in the values
npm run dev              # http://localhost:3000
```
Start the server first (see the server README), then run `npm run seed` there to create the admin and demo menu.
Before deploying run `npm run typecheck && npm run build`.

## Environment variables
`NEXT_PUBLIC_API_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `MONGODB_URI`, `DB_NAME`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
Google OAuth redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`. `.env` files are git-ignored.

## Challenge implementation notes
- **Advanced search & sorting** — the Browse page keeps filters in the URL (`/menu?search=&category=&location=&minPrice=&maxPrice=&sort=price_asc&page=2`), debounces the search box and calls `GET /api/menu` with the same params (details in the server README).
- **JWT verification** — `src/lib/api.ts` fetches a 15-minute JWT from Better Auth (`authClient.token()`), caches it until it nears expiry, adds `Authorization: Bearer …`, and retries once with a fresh token on `401`. The Express middleware verifies it via JWKS and rejects invalid/expired tokens.
- **Reload safety** — `middleware.ts` only checks for the session cookie, and the dashboard layout waits for the session to settle before redirecting, so reloading a private route never bounces a signed-in user to Sign In.

## Notes
- Google sign-in creates **customer** accounts; vendors register with email + password.
- Premium is activated only after the verified Stripe webhook; the success page just polls the payment status.
