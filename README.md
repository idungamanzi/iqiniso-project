# IQINISO Construction — Full Stack Website

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.11-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)

A production-ready, full-stack website for **IQINISO Construction** — a South African construction company based in Newcastle, KwaZulu-Natal. Built with a REST API backend and a React frontend, featuring a JWT-protected admin panel for full content management.

---

## Live Demo

🌐 **Website:** [iqiniso-project.onrender.com](https://iqiniso-project.onrender.com)
🔒 **Admin Panel:** Available at a secured path (rate-limited, JWT-protected)

---

## Features

### Public Website
- **Home** — Hero section, services preview, featured projects, call-to-action
- **About** — Company history, vision, mission, registration details, policies
- **Services** — All construction services with descriptions and images
- **Projects** — Filterable portfolio (Completed / Ongoing) with project details
- **Gallery** — Categorised photo gallery with lightbox viewer
- **Contact** — Validated contact form with rate limiting and spam detection

### Admin Panel
- **Dashboard** — Stats overview (services, projects, gallery, messages)
- **Company Info** — Edit all company details, logo, social links, Google Maps
- **Services** — Full CRUD with image upload
- **Projects** — Full CRUD with image upload, status, featured flag
- **Gallery** — Upload/delete photos by category
- **Messages** — Read contact submissions, update status, reply via email, add notes

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 18+, Express.js, TypeScript |
| **ORM** | Prisma (type-safe queries) |
| **Database** | PostgreSQL (production) / SQLite (development) |
| **Auth** | JWT — 4h expiry, rate-limited login (5 attempts/15min) |
| **Validation** | Zod (runtime + compile-time) |
| **File Uploads** | Multer (MIME-validated, sanitised filenames) |
| **Frontend** | React 18, Vite 5, TypeScript |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios (typed, with interceptors) |
| **Deployment** | Render (backend + frontend + PostgreSQL) |

---

## Security Highlights

- JWT authentication required on all admin API endpoints
- Rate limiting at three levels: general API, contact form, and login
- Helmet.js security headers (XSS, clickjacking, MIME sniffing protection)
- CORS strict allowlist — no wildcards in production
- Zod schema validation on all inputs with spam keyword detection
- File upload MIME type validation — executable files blocked
- Sanitised upload filenames preventing path traversal attacks
- Obscured admin URL — not the predictable `/admin`
- Identical error response for wrong email and wrong password — prevents user enumeration

---

## Project Structure

```
iqiniso-node/
├── backend/
│   ├── prisma/schema.prisma      # Database models
│   ├── src/
│   │   ├── lib/prisma.ts         # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification
│   │   │   ├── upload.ts         # Multer file handling
│   │   │   └── errorHandler.ts   # Global error handling
│   │   ├── routes/
│   │   │   ├── public.ts         # Public API endpoints
│   │   │   ├── contact.ts        # Contact form + rate limiting
│   │   │   └── admin.ts          # Protected admin CRUD
│   │   ├── utils/
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   └── helpers.ts        # Utilities (slug, fileUrl, IP)
│   │   ├── seed.ts               # Database seeder
│   │   └── server.ts             # Express entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── admin/                # Admin panel (10 components)
    │   ├── components/           # Navbar, Footer, Pages, UI
    │   ├── context/              # CompanyContext
    │   ├── hooks/useFetch.ts     # Generic data-fetching hook
    │   ├── services/api.ts       # Typed Axios client
    │   └── types/index.ts        # Shared TypeScript interfaces
    └── vite.config.ts
```

---

## API Reference

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/core/info` | Company information |
| GET | `/api/v1/services` | List all active services |
| GET | `/api/v1/projects` | Projects (`?status=COMPLETED&featured=true`) |
| GET | `/api/v1/projects/:slug` | Single project with images |
| GET | `/api/v1/gallery` | Gallery images (`?category=WORKERS`) |
| POST | `/api/v1/contact` | Submit contact form |
| GET | `/health` | Health check |

### Admin Endpoints (Bearer JWT required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/admin/login` | Authenticate, receive token |
| GET/PUT | `/api/v1/admin/company` | Manage company info |
| CRUD | `/api/v1/admin/services` | Manage services |
| CRUD | `/api/v1/admin/projects` | Manage projects |
| CRUD | `/api/v1/admin/gallery` | Manage gallery images |
| GET/PATCH | `/api/v1/admin/messages` | Manage contact messages |

---

## Local Setup

```bash
# 1. Backend
cd backend
npm install
copy .env.example .env   # Windows | use cp on Mac/Linux
# Edit .env: set JWT_SECRET and DATABASE_URL

npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
npm run dev              # API at http://localhost:3001

# 2. Frontend (open a second terminal)
cd frontend
npm install
npm run dev              # Site at http://localhost:5173
```

---

## Deployment (Render)

| Service | Type | Root Dir | Build Command |
|---|---|---|---|
| Backend | Web Service | `backend` | `npm install && npm run build && npx prisma generate && npx prisma migrate deploy` |
| Frontend | Static Site | `frontend` | `npm install && npm run build` |
| Database | PostgreSQL | — | Managed by Render |

Set `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1` on the frontend static site.
Add a rewrite rule: `/*` → `/index.html` for SPA routing.

---

## License

Copyright © 2025 IQINISO Construction. All rights reserved.
This source code is proprietary and confidential. Unauthorised copying or distribution is prohibited.
