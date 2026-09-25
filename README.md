# Dubai Visa Application

## Overview

A full-stack visa application website built with Django (backend) and React (frontend), using Supabase for database and file storage, and Stripe for payments.

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Supabase project
- Stripe account (test mode)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase and Stripe credentials

# Run migrations (uses direct DB connection)
python manage.py migrate

# Seed initial data
python manage.py seed_data

# Create superuser (for admin access)
python manage.py createsuperuser

# Run dev server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API base URL and Stripe publishable key
npm run dev
```

### Environment Variables

**Backend (.env):**
- `SECRET_KEY` — Django secret key
- `DATABASE_URL` — Supabase connection pooler URL (port 6543, for runtime)
- `SUPABASE_DB_DIRECT_URL` — Supabase direct connection URL (port 5432, for migrations only)
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_KEY` — Your Supabase service role key
- `RAZORPAY_KEY_ID` — Razorpay key ID (public, also used in frontend)
- `RAZORPAY_KEY_SECRET` — Razorpay key secret (server only, never expose)
- `RAZORPAY_WEBHOOK_SECRET` — Razorpay webhook signing secret
- `CORS_ALLOWED_ORIGINS` — Comma-separated list of allowed origins
- `SUPABASE_STORAGE_BUCKET` — Supabase storage bucket name (default: visa-documents)

**Frontend (.env):**
- `VITE_API_BASE_URL` — Backend API base URL
- `VITE_RAZORPAY_KEY_ID` — Razorpay key ID (public)

### Running Migrations

```bash
# Uses SUPABASE_DB_DIRECT_URL for migrations (direct connection, not pooler)
python manage.py migrate
```

### Admin Access

```bash
python manage.py createsuperuser
# Visit http://localhost:8000/admin/
```

## Architecture

- **Backend:** Django 5 + DRF, connected to Supabase Postgres via psycopg2
- **Frontend:** React 18 + Vite + React Router + Tailwind CSS
- **Database:** Supabase PostgreSQL
- **File Storage:** Supabase Storage (via supabase-py client)
- **Payments:** Stripe Payment Intents API + Webhooks
- **Connection Strategy:** Pooler URL (port 6543) for runtime queries, direct connection (port 5432) for migrations only

## Key Security Features

- All secrets loaded from environment variables
- Stripe Payment Intent amount always calculated server-side from Pricing table
- Reference number generation uses DB-level unique constraint with retry logic
- File uploads validated by content type (python-magic), not just extension
- Rate limiting on application and payment endpoints
- Webhook signature verification mandatory
- CORS restricted to allowed origins
- `DEBUG=False` in production with SSL redirect

## Deployment

- **Frontend:** Deploy to Vercel (connect GitHub repo)
- **Backend:** Deploy to Railway or Render
- **Set environment variables** in the hosting dashboard
- Run migrations after deployment

## License

MIT
