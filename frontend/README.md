# Ledger — Expense Tracker (Frontend)

A React + Vite frontend for the expense tracker API. Plain CSS throughout (no
Tailwind or component framework) with a ledger-inspired visual identity:
warm paper background, serif numerals, muted income/expense colors.
Mobile-first — bottom tab bar under 768px, sidebar nav above it.

## Stack
- React 19 + Vite
- React Router for navigation
- Axios with JWT auth + automatic token refresh
- Recharts for the income/expense trend chart
- lucide-react for icons
- Plain CSS (custom properties for design tokens, no framework)

## Setup
```bash
npm install
cp .env.example .env    # point VITE_API_BASE_URL at your backend
npm run dev
```
App runs at `http://127.0.0.1:5173`. Make sure the Django backend is running
(see backend README) and that its `CORS_ALLOWED_ORIGINS` includes this URL.

## Environment
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```
Change this to your deployed backend URL before building for production.

## Build
```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Structure
```
src/
  api/          — one module per resource (auth, accounts, categories, transactions, reports)
  context/      — AuthContext (JWT session state)
  components/   — Layout (responsive nav), Modal, ProtectedRoute
  pages/        — Login, Register, Dashboard, Transactions, Accounts, Categories
  styles/       — tokens.css (design system variables), components.css (shared UI primitives)
```

## Auth flow
- Login/register hit `/api/auth/login/` and `/api/auth/register/` (username + password, matching the backend's Django auth field). Register also requires `confirm_password`.
- Access + refresh tokens are stored in `localStorage`.
- An axios response interceptor catches `401`s, refreshes the access token once, and retries the original request — falls back to `/login` if the refresh token is also invalid.

## Notes on the backend contract
This frontend is built against the exact field names the backend uses:
`account_type`, `transaction_type`, `transaction_date` (not the more generic
`type`/`date`). If you rename fields on the backend, update `src/api/*.js`
to match.

Validation split between frontend and backend:
- **Frontend-enforced**: amount must be > 0, transaction date can't be in the future.
- **Backend-enforced**: an expense can't exceed its account's current balance ("Insufficient balance"), accounts/categories are scoped to the logged-in user.
- **Not yet supported by the backend**: editing your profile (username/email) after registration — the `/api/auth/profile/` endpoint is currently read-only (`GET` only, no `PUT`/`PATCH`).

## What I'd add with more time
- Backend: `PATCH` support on `/api/auth/profile/` so users can edit their profile
- Search box for transactions (backend already supports `?search=` on description)
- Sort controls (backend supports `ordering=amount|transaction_date|created_at`)
- Skeleton loading states instead of plain "Loading…" text
- Dark mode via a second token set
