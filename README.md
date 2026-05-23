# CMUQ MSA Links

> A Linktree-style link aggregator for the Carnegie Mellon University Qatar Muslim Students Association.

> **Production:** Deploy **links.cmuqmsa.org** from [cmuqmsa-infra](https://github.com/CMUQ-MSA/cmuqmsa-infra), not this repo’s `docker-compose.yml`. The per-app compose file is legacy and can bind host ports that conflict with unified infra (Caddy on `localhost:8080`). Use it only when debugging this app alone.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Architecture

```
┌────────────┐      ┌──────────────┐      ┌───────────────┐
│   nginx    │ ───▶ │   FastAPI    │ ───▶ │  SQLite DB    │
│ (port 8080)│      │  (port 8000) │      │  (data/       │
│ serves SPA │      │  REST API    │      │   links.db)   │
└────────────┘      └──────────────┘      └───────────────┘
    ▲
    │ static files
┌────────────┐
│  React     │
│  (Vite)    │
│  build     │
└────────────┘
```

| Layer     | Tech                                  |
| --------- | ------------------------------------- |
| Frontend  | React 18 + Vite + Tailwind + Framer Motion |
| Backend   | FastAPI + SQLAlchemy + SQLite          |
| Auth      | Master-password → signed cookie        |
| Icons     | Lucide React (dynamic by name)         |
| Proxy     | nginx-unprivileged                      |
| Deploy    | Docker Compose (2 services)             |

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Run
```bash
# 1. Copy and edit the env file
cp .env.example .env
# Edit .env → set ADMIN_PASSWORD and SECRET_KEY

# 2. Deploy
./deploy.sh

# Site is now live at http://localhost:8080
# Admin dashboard at http://localhost:8080/admin
```

In CMUQ-MSA production, this app is intended to run at **links.cmuqmsa.org**. The central `cmuqmsa-infra` Caddy router sends that hostname to this app's nginx service on internal port `8080`; nginx serves the React frontend and proxies `/api` to FastAPI.

### Local Development (no Docker)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
mkdir -p data
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173  (API proxied to :8000)
```

## Environment Variables

| Variable         | Description                        | Default              |
| ---------------- | ---------------------------------- | -------------------- |
| `SECRET_KEY`     | Signs session cookies              | `change-me`          |
| `DEBUG`          | Enable debug logging               | `false`              |
| `USE_HTTPS`      | Mark admin cookie secure in production | `false`          |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins       | `https://links.cmuqmsa.org` |
| `DATABASE_URL`   | SQLite connection string           | `sqlite:///./data/links.db` |
| `ADMIN_PASSWORD` | Master password for `/admin`       | `changeme123`        |

Production startup fails if `SECRET_KEY` or `ADMIN_PASSWORD` still use placeholder/default values.

## API Endpoints

| Method   | Path                  | Auth   | Description                |
| -------- | --------------------- | ------ | -------------------------- |
| `GET`    | `/api/links`          | Public | Visible links (ordered)    |
| `GET`    | `/api/links/all`      | Admin  | All links (incl. hidden)   |
| `POST`   | `/api/links`          | Admin  | Create a link              |
| `PUT`    | `/api/links/:id`      | Admin  | Update a link              |
| `DELETE` | `/api/links/:id`      | Admin  | Delete a link              |
| `PUT`    | `/api/links/reorder/batch` | Admin | Reorder links          |
| `POST`   | `/api/auth/login`     | —      | Login (set cookie)         |
| `POST`   | `/api/auth/logout`    | —      | Logout (clear cookie)      |
| `GET`    | `/api/auth/me`        | Admin  | Check session              |
| `GET`    | `/api/health`         | Public | Health check               |

## Project Structure

```
cmuqmsa-links/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # FastAPI app + seed data
│       ├── config.py          # Pydantic settings
│       ├── database.py        # SQLAlchemy engine
│       ├── models.py          # Link + SiteConfig models
│       ├── schemas.py         # Pydantic request schemas
│       ├── middleware/
│       │   └── auth.py        # Cookie-based admin auth
│       └── routers/
│           ├── auth.py        # Login/logout/me
│           └── links.py       # CRUD + reorder
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/client.ts      # Typed API client
│       ├── types/index.ts
│       ├── styles/globals.css
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── LinkCard.tsx
│       │   └── SocialBar.tsx
│       └── pages/
│           ├── PublicPage.tsx  # "/"  — the linktree
│           └── AdminPage.tsx  # "/admin" — link manager
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── deploy.sh
├── .env.example
└── README.md
```

## License

MIT
