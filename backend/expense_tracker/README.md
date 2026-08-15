# Expense Tracker — Backend (Django + DRF)

A personal expense tracker API. Users register, manage accounts and
categories, log income/expense transactions, and pull spending reports.

## Stack
- Django 5.2 (LTS) + Django REST Framework
- JWT auth (djangorestframework-simplejwt)
- MySQL in production, SQLite for local dev (toggle via `DB_ENGINE` env var)
- drf-spectacular for OpenAPI/Swagger docs

## Data model
User
├── Account (name, account_type, balance)
├── Category (name — unique per user)
└── Transaction (account, category, transaction_type, amount, transaction_date)

Creating/editing/deleting a transaction updates its account's `balance`
automatically (see `transactions/services.py`). An expense can't be created
if it would exceed the account's current balance.

## Setup (local dev)
`requirements.txt` and the virtual environment live in `backend/`;
`manage.py` and the Django project itself live in `backend/expense_tracker/`.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # .venv\Scripts\activate on Windows
pip install -r requirements.txt

cd expense_tracker
cp .env.example .env            # DB_ENGINE=sqlite by default, no changes needed
python manage.py migrate
python manage.py createsuperuser  # optional, for /admin/
python manage.py runserver
```
API is now at `http://127.0.0.1:8000/api/`. Interactive docs at
`http://127.0.0.1:8000/api/schema/swagger-ui/`.

## Switching to MySQL
Edit `expense_tracker/.env`:

DB_ENGINE=mysql
DB_NAME=expense_tracker
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

No code changes needed. Requires MySQL client dev headers to install
`mysqlclient` (e.g. `sudo apt install default-libmysqlclient-dev
build-essential pkg-config` on Debian/Ubuntu; prebuilt wheels usually work
out of the box on Windows).

**MySQL version:** this project pins `Django==5.2` (LTS), which supports
MySQL 8.0.11 and higher. Django 6.1 raised its minimum to MySQL 8.4+ — if
you ever bump the Django version, check your MySQL version against the
[Django release notes](https://docs.djangoproject.com/en/stable/releases/)
first, or you'll hit `NotSupportedError: MySQL 8.4 or later is required`.

## API reference

| Endpoint | Methods | Notes |
|---|---|---|
| `/api/auth/register/` | POST | public. Requires `username`, `email`, `password`, `confirm_password` |
| `/api/auth/login/` | POST | `username` + `password` → returns `access` + `refresh` JWT |
| `/api/auth/refresh/` | POST | refresh access token |
| `/api/auth/profile/` | GET | current user info (read-only — no edit endpoint yet) |
| `/api/accounts/` | GET, POST | list/create |
| `/api/accounts/:id/` | GET, PUT, DELETE | |
| `/api/categories/` | GET, POST | category names are unique per user (case-insensitive) |
| `/api/categories/:id/` | GET, PUT, DELETE | |
| `/api/transactions/` | GET, POST | filter: `?transaction_type=&account=&category=`, search: `?search=`, sort: `?ordering=amount\|transaction_date\|created_at` |
| `/api/transactions/:id/` | GET, PUT, DELETE | |
| `/api/reports/summary/` | GET | income/expense/net for all-time |
| `/api/reports/categories/` | GET | expense total grouped by category |
| `/api/reports/monthly/` | GET | income/expense per month, per type |

All endpoints except register/login require `Authorization: Bearer <access_token>`.
Every queryset is scoped to `request.user` — no user can see or modify another
user's data.

## Known gaps
- No endpoint to edit a user's profile after registration (`/api/auth/profile/`
  is `GET`-only).
- `summary/` and `categories/` reports return all-time totals only — no
  month/year filtering yet (`monthly/` already breaks down by month).
- No automated tests yet (`tests.py` files are empty stubs).

## Production checklist
- Set `DEBUG=False`
- Set a real `SECRET_KEY`
- Set `ALLOWED_HOSTS` to your actual domain
- Set `DB_ENGINE=mysql` and the `DB_*` vars (check your MySQL version — see above)
- Set `CORS_ALLOWED_ORIGINS` to your deployed frontend's URL only
- Run `python manage.py collectstatic --noinput`
- Serve with `gunicorn expense_tracker.wsgi:application` (already in requirements.txt), not `runserver`

