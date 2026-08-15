# Ledger — Expense Tracker

A full-stack personal expense tracker: users track income and expenses
across multiple accounts, organize them by category, and view spending
reports. Built as a portfolio project demonstrating a relational schema,
a real REST API, and a deployed full-stack app.

## Stack
- **Backend**: Django + Django REST Framework, JWT auth, MySQL (SQLite for local dev)
- **Frontend**: React + Vite, plain CSS (no framework), mobile-first
- **Auth**: JWT access/refresh tokens, auto-refresh on the frontend

## Project structure
```
backend/expense_tracker/   — Django project (see backend/expense_tracker/README.md)
frontend/                  — React app (see frontend/README.md)
```

## Quick start (local dev)

**1. Backend**
```bash
cd backend/expense_tracker
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```
Runs at `http://127.0.0.1:8000`.

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Runs at `http://127.0.0.1:5173`. Make sure the backend is running first —
the frontend calls it directly, and its `CORS_ALLOWED_ORIGINS` needs to
include `http://127.0.0.1:5173` (it does, by default, in `.env.example`).

Register a new account in the app to get started.

## Data model
```
User
 ├── Account       (name, type, balance — auto-updated by transactions)
 ├── Category      (name)
 └── Transaction   (account, category, type, amount, date)
```

## Features
- JWT-based register/login with auto token refresh
- Accounts with running balances (auto-updated on transaction create/edit/delete)
- Categories, shared across income and expense
- Transactions with filtering by type/account/category
- Dashboard with income vs. expense trend chart and category breakdown
- Business rule: an expense can't exceed its account's current balance
- Client-side validation: amount must be positive, date can't be in the future

## Known limitations
- No profile-editing endpoint yet (backend is read-only on `/api/auth/profile/`)
- No automated backend test suite yet

## More detail
- [Backend README](backend/expense_tracker/README.md) — full API reference, MySQL setup, production checklist
- [Frontend README](frontend/README.md) — component structure, design notes
