# Copilot Instructions — CMUQ MSA Links

## Architecture

Linktree clone: **FastAPI backend** + **React/Vite frontend** + **nginx reverse proxy**, all Dockerized.

```
nginx (:80) → serves SPA at / → proxies /api/ → FastAPI (:8000) → SQLite (data/links.db)
```

- **3 Docker services** defined in `docker-compose.yml`: `backend` (Python 3.11), `frontend-builder` (Node 20, builds then exits), `nginx` (serves static + proxies API).
- Frontend is a **build-only container** — it runs `npm run build`, copies `dist/` to a shared Docker volume (`frontend_dist`), then exits. nginx serves those static files. There is no dev server in production.
- SQLite DB and uploaded files live in `./data/` (host-mounted volume).

## Key Conventions

- **Auth**: Single master password (`ADMIN_PASSWORD` env var) → `itsdangerous` signed cookie (`session`), 24h expiry. Admin endpoints use `Depends(require_admin)` from `backend/app/middleware/auth.py`.
- **Public vs Admin endpoints**: Public endpoints (no auth): `GET /api/links`, `GET /api/config`, `GET /api/socials`, `GET /api/qr`, `GET /api/uploads/{filename}`. Admin endpoints require the session cookie.
- **Models use `to_dict()`** for serialization (not Pydantic `from_orm`). All IDs are UUID4 strings.
- **Config is a key-value store** (`SiteConfig` table) — not a single row. The `config` router reads all rows and merges with `DEFAULTS` dict.
- **Frontend routing**: `/` → `PublicPage`, `/admin` → `AdminPage` (React Router). SPA fallback handled by nginx (`try_files $uri /index.html`).
- **Tailwind custom colors**: `crimson` (#990000 scale) and `gold` (#D4AF37 scale) defined in `tailwind.config.js`. Use these, not raw hex.
- **Component utility classes** in `frontend/src/styles/globals.css`: `btn-gold`, `btn-ghost`, `btn-danger`, `card-link`, `input-field`.
- **Icons**: Lucide React. `LinkCard` resolves icon names dynamically (`bus` → `Bus` component). Store icon names as lowercase-kebab in the DB.

## Deploy & Development

```bash
./deploy.sh              # docker compose down && up --build -d
# IMPORTANT: frontend uses Docker build cache. After frontend changes:
docker compose build --no-cache frontend-builder
docker volume rm cmuqmsa-links_frontend_dist  # clear old static files
docker compose up -d
```

To wipe the DB (schema changes require this — no migrations):
```bash
docker compose down
sudo rm -f data/links.db
docker compose up --build -d    # will re-seed from SEED_LINKS/SEED_SOCIALS/SEED_CONFIG in main.py
```

## Backend Patterns

- **Add a new router**: Create `backend/app/routers/foo.py` with `router = APIRouter(prefix="/api/foo")`, register in `routers/__init__.py`, include in `main.py`.
- **Schema convention**: `FooCreate` (POST body), `FooUpdate` (PUT body, all fields Optional), model has `to_dict()`.
- **File uploads**: Saved to `/app/data/uploads/` with UUID prefix. Served at `/api/uploads/{filename}`. Max 10MB. Allowed: png, jpg, jpeg, gif, webp, svg, pdf, ico.
- **Seed data** lives in `main.py` (`SEED_LINKS`, `SEED_SOCIALS`, `SEED_CONFIG`) — only inserted when tables are empty.

## Frontend Patterns

- **API client** (`frontend/src/api/client.ts`): All API calls go through `request<T>()` helper. Uses `credentials: "include"` for cookie auth. File uploads use raw `fetch` with `FormData` (no Content-Type header).
- **Types** in `frontend/src/types/index.ts` — keep in sync with backend schemas.
- **AdminPage** uses a tabbed UI (Links / Settings / Socials / Files) — each tab is a separate component function within the same file.
- **PublicPage** fetches config + links + socials via `Promise.all` and applies dynamic background colors from config.
- **Framer Motion** for animations on `Header` and `LinkCard`. Keep `initial/animate/transition` props consistent.
