# PRD — PT. Geya Mora Agung Landing Page

## Original Problem Statement
> optimasi dan buatkan landing page yang dinamis untuk file html ini, tambahkan menu blog, tambahkan image dan map yang sesuai konteks menurutmu, buatkan bilingual dan switcher bahasa IND dan ENG dengan icon bendera masing2 negara, lalu buatkan paket file nya untuk saya copy ke vs code

Source: `gma-landing-v3.html` — static bilingual corporate landing for PT. Geya Mora Agung (Medan, Sumatera Utara).

## User Choices
1. Format: Full-stack React + FastAPI + MongoDB
2. Blog: Dynamic with admin panel
3. Map: Google Maps embed iframe (no API key)
4. Optimizations: All (SEO, performance, animations, dark mode, functional contact form)
5. Images: Real photos from Unsplash

## Stack
- Frontend: React 19, React Router v7, Tailwind, shadcn/ui, Framer Motion, i18next, react-fast-marquee, react-helmet-async
- Backend: FastAPI, Motor (async MongoDB), bcrypt, PyJWT, python-slugify
- DB: MongoDB (collections: users, blog_posts, contact_submissions)

## User Personas
- **Prospective B2B partner** — visits landing, reads services/sectors, submits contact form or WhatsApp.
- **Blog reader** — browses insights, reads bilingual articles.
- **GMA admin** — logs in at `/admin/login`, manages blog posts & contact inbox.

## Core Requirements
- Bilingual IND/ENG with circular flag switcher (persistent)
- Dark mode toggle (persistent)
- Sticky navbar with scroll-shrink
- All 8 KBLI-coded services, 5 industry sectors, 6 why-choose-us items
- Dynamic blog: list + detail pages with bilingual content
- Admin panel: blog CRUD + contact inbox
- Google Maps iframe for office location
- Functional contact form saved to MongoDB
- SEO: meta/OG/Twitter + JSON-LD Organization + BlogPosting
- Non-generic typography (Clash Display + IBM Plex Sans)
- Premium Swiss high-contrast aesthetic with sharp edges + orange accent

## Implemented (2026-05-01)
- Backend FastAPI server with JWT auth, 6 seeded bilingual blog posts, seed admin (admin@gma.co.id / gma-admin-2024)
- Frontend with all sections (Hero parallax, Ticker, About, Services bento grid, Sectors masonry, Why Us, BlogPreview, FAQ, Contact + Map, CTA, Footer)
- Bilingual i18next with full ID/EN locale files
- Dark mode via CSS variables
- Admin dashboard (/admin) with sidebar, blog editor modal, contact viewer
- Google Maps iframe pointing to Jl. Bambu No. 18H, Gaharu, Medan Timur
- SEO via react-helmet-async
- Package zip at `/app/downloads/gma-landing.zip` (308 KB, 109 files) for VS Code
- Backend tests: 21/21 passed
- Frontend tests: 21/21 passed

## Backlog (P1/P2)
- P1: Newsletter subscription
- P1: Admin "mark as read" UI control in contacts table
- P1: Blog rich-text editor (currently plain textarea)
- P1: Image upload for blog (currently URL input)
- P2: Multi-admin roles (editor vs super-admin)
- P2: Blog categories as its own collection + filter UI
- P2: Analytics dashboard in admin
- P2: Email notification on new contact form submission (SendGrid/Resend)
- P2: Sitemap.xml + robots.txt generator
