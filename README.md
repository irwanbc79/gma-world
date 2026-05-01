# PT. Geya Mora Agung — Landing Page

Dynamic bilingual (🇮🇩 Indonesia / 🇬🇧 English) landing page with admin panel, blog CMS, dark mode, and Google Maps integration.

## Stack
- **Frontend:** React 19 + React Router + Tailwind + shadcn/ui + Framer Motion + i18next
- **Backend:** FastAPI + Motor (MongoDB async) + JWT + bcrypt
- **Database:** MongoDB

## Features
- Bilingual (ID/EN) with circular SVG flag switcher; persisted in localStorage
- Dark mode toggle (persisted)
- Hero with parallax, scroll reveal animations, ticker marquee
- 8 services (KBLI-coded), 5 industry sectors, 6 reasons-to-choose-us
- Dynamic Blog: list + detail pages, bilingual titles/content, SEO-friendly slugs
- FAQ accordion
- Contact form saved to DB + WhatsApp deeplink + Google Maps iframe (office location)
- Admin panel (protected): blog CRUD + contact inbox
- SEO: meta/OG/Twitter tags + JSON-LD Organization & BlogPosting schema
- Fonts: Clash Display (headings) + IBM Plex Sans (body) — no generic Inter/Roboto

## Setup

### 1. MongoDB
Make sure MongoDB is running locally (`mongod`) or set a hosted connection string in `backend/.env`.

### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # edit if needed
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

On first startup the backend will:
- Seed an admin user using `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Seed 6 bilingual blog posts

### 3. Frontend
```bash
cd frontend
yarn install           # or npm install
cp .env.example .env   # point REACT_APP_BACKEND_URL to your backend
yarn start             # http://localhost:3000
```

## Default Admin Credentials

- **Email:** `admin@gma.co.id`
- **Password:** `gma-admin-2024`
- **Login URL:** `http://localhost:3000/admin/login`

> Change these in `backend/.env` before deploying. The seed is idempotent — if the password in `.env` differs from the stored hash it will be updated on startup.

## API Overview

Public:
- `GET  /api/blog` — list published posts
- `GET  /api/blog/{slug}` — single post
- `POST /api/contact` — submit contact form

Auth:
- `POST /api/auth/login` — returns user + sets httpOnly cookie
- `GET  /api/auth/me`
- `POST /api/auth/logout`

Admin (requires auth):
- `GET/POST/PUT/DELETE /api/admin/blog[/{id}]`
- `GET/DELETE /api/admin/contacts[/{id}]`
- `PATCH /api/admin/contacts/{id}/read`

## Customization

- **Company info:** `frontend/src/lib/config.js` (`COMPANY`)
- **Images:** `frontend/src/lib/config.js` (`IMAGES`)
- **Colors:** `frontend/src/index.css` (CSS variables — `--primary`, `--accent`, …)
- **Translations:** `frontend/src/locales/id.json` + `en.json`
- **Google Map location:** `frontend/src/lib/config.js` → `COMPANY.mapEmbedSrc` (uses `?output=embed` — no API key needed)

## Deployment

Set the following env vars:
- `backend/.env`: `MONGO_URL`, `DB_NAME`, `JWT_SECRET` (64+ chars random), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS` (your frontend URL)
- `frontend/.env`: `REACT_APP_BACKEND_URL` (your backend URL)

Build frontend: `yarn build` → serve `frontend/build/` from any static host.

---

© PT. Geya Mora Agung — NIB 0711240094152
