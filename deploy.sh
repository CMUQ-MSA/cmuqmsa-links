#!/usr/bin/env bash
set -e

# ── Usage ───────────────────────────────────────────────
# ./deploy.sh              Rebuild changed services and restart
# ./deploy.sh --frontend   Rebuild frontend/nginx image without cache
# ./deploy.sh --full       Rebuild all images without cache
# ./deploy.sh --wipe       Full rebuild + wipe the database (schema changes)

FLAG="${1:-}"

echo "🔨 CMUQ MSA Links — Deploy"

case "$FLAG" in
  --frontend|-f)
    echo "🎨 Frontend rebuild (immutable nginx image, no cache)..."
    docker compose build --no-cache nginx
    docker compose up -d --remove-orphans
    ;;
  --full|-a)
    echo "🔄 Full rebuild (all services, no cache)..."
    docker compose build --no-cache
    docker compose up -d --remove-orphans
    ;;
  --wipe|-w)
    echo "⚠️  Full rebuild + DATABASE WIPE..."
    read -p "   This deletes links.db. Continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Aborted."
      exit 1
    fi
    docker compose stop backend
    rm -f data/links.db
    docker compose build --no-cache
    docker compose up -d --remove-orphans
    echo "   DB wiped — seed data will be re-inserted on first request."
    ;;
  ""|--backend|-b)
    echo "⚡ Deploy changed services..."
    docker compose up --build -d --remove-orphans
    ;;
  *)
    echo "Usage: ./deploy.sh [--backend|-b] [--frontend|-f] [--full|-a] [--wipe|-w]"
    echo ""
    echo "  (no flag)     Rebuild changed services and restart"
    echo "  --frontend -f Frontend/nginx no-cache image rebuild"
    echo "  --full     -a Full no-cache rebuild of everything"
    echo "  --wipe     -w Full rebuild + delete database (for schema changes)"
    exit 1
    ;;
esac

echo "✅ Deployed! Site is live at http://localhost:8080."
