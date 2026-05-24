# CMUQ MSA Links

A lightweight link hub for the Carnegie Mellon University in Qatar Muslim Students Association.

## Stack


| Layer          | Tech                                         |
| -------------- | -------------------------------------------- |
| Frontend       | React 18 + Vite + Tailwind CSS               |
| Backend        | FastAPI + SQLAlchemy + SQLite                |
| Auth           | Signed admin session cookie                  |
| Static serving | `nginxinc/nginx-unprivileged` on port `8080` |
| Deployment     | Docker Compose (`backend` + `nginx`)         |


The public site and admin UI are served by the same nginx container. `/api/*` is proxied to the FastAPI backend.

## Runtime Architecture

```text
browser
  -> nginx (127.0.0.1:8080 -> container :8080)
      -> static React build
      -> /api/* -> backend:8000
          -> SQLite at ./data/links.db
          -> uploads at ./data/uploads/
```

## Quick Start

1. Create the env file:

```bash
cp .env.example .env
```

1. Set real values for:

- `SECRET_KEY`
- `ADMIN_PASSWORD`
- `ALLOWED_ORIGINS`

1. Start the app:

```bash
./deploy.sh
```

Then open:

- public site: `http://localhost:8080/`
- admin: `http://localhost:8080/admin`

## Docker Compose

The standalone repo uses one compose stack:

- `backend`: FastAPI on internal port `8000`
- `nginx`: immutable frontend + reverse proxy on `127.0.0.1:8080`

Useful commands:

```bash
docker compose up --build -d
docker compose logs -f
docker compose down
```

`deploy.sh` is a small wrapper around those compose operations:

```bash
./deploy.sh            # rebuild changed services and restart
./deploy.sh --frontend # rebuild nginx/frontend image without cache
./deploy.sh --full     # rebuild all images without cache
./deploy.sh --wipe     # rebuild all images and delete ./data/links.db
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdir -p data/uploads
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies API traffic to `http://localhost:8000`.

## Environment Variables


| Variable          | Required | Description                                                            |
| ----------------- | -------- | ---------------------------------------------------------------------- |
| `SECRET_KEY`      | Yes      | Session signing key. Must be long and random in production.            |
| `ADMIN_PASSWORD`  | Yes      | Admin password bootstrap value and login secret.                       |
| `ALLOWED_ORIGINS` | Yes      | Comma-separated list of allowed browser origins.                       |
| `DATABASE_URL`    | No       | Defaults to `sqlite:///./data/links.db`.                               |
| `DEBUG`           | No       | Enables debug logging when `true`.                                     |
| `USE_HTTPS`       | No       | Marks the admin cookie `Secure` when `true`. Use `true` in production. |


Production startup is expected to fail if placeholder secrets are left in place.

## Admin and Icons

The admin UI supports:

- link CRUD
- drag-and-drop reordering
- file uploads
- site branding and social links
- QR code generation for the public page

Link icons now use a curated catalog. Admins choose icons from the built-in picker, and the backend validates icon ids on create/update. Existing invalid icon values are normalized to `link` on backend startup.

## Health and Storage

- backend health: `GET /api/health`
- nginx health: `GET /healthz`
- database file: `./data/links.db`
- uploaded files: `./data/uploads/`

## Production Notes

- If you deploy this repo by itself behind a reverse proxy, proxy public traffic to `http://127.0.0.1:8080`.
- Do not commit `.env` or real uploaded data.
