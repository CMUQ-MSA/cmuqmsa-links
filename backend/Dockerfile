# Stage 1: build the frontend so we can bake its index.html into the backend
# image. The whole point is that the backend serves the SPA shell with
# bootstrap data inlined (see app/routers/spa.py), which means it needs the
# index.html that matches the currently-deployed assets (hashed URLs).
FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build


# Stage 2: the actual backend image
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app/ ./app/

# Only the index.html is needed — the hashed /assets/* bundles are still
# served by the nginx (frontend) container. Backend just renders the shell.
COPY --from=frontend-build /build/dist/index.html /app/static/index.html

RUN groupadd --gid 1001 app \
    && useradd --uid 1001 --gid app --create-home app \
    && mkdir -p /app/data/uploads \
    && chown -R app:app /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
