#!/usr/bin/env bash
set -e

# ── Usage ───────────────────────────────────────────────
# ./deploy.sh              Backend-only changes (fast)
# ./deploy.sh --frontend   Frontend changes (rebuilds + clears dist volume)
# ./deploy.sh --full       Nuke everything and rebuild from scratch
# ./deploy.sh --wipe       Full rebuild + wipe the database (schema changes)

FLAG="${1:-}"

echo "🔨 CMUQ MSA Links — Deploy"

case "$FLAG" in
  --frontend|-f)
    echo "🎨 Frontend rebuild (no-cache + fresh volume)..."
    docker compose down
    docker compose build --no-cache frontend-builder
    docker volume rm -f cmuqmsa-links_frontend_dist 2>/dev/null || true
    docker compose up --build -d
    ;;
  --full|-a)
    echo "🔄 Full rebuild (all services, no cache)..."
    docker compose down
    docker compose build --no-cache
    docker volume rm -f cmuqmsa-links_frontend_dist 2>/dev/null || true
    docker compose up -d
    ;;
  --wipe|-w)
    echo "⚠️  Full rebuild + DATABASE WIPE..."
    read -p "   This deletes links.db. Continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Aborted."
      exit 1
    fi
    docker compose down
    rm -f data/links.db
    docker compose build --no-cache
    docker volume rm -f cmuqmsa-links_frontend_dist 2>/dev/null || true
    docker compose up -d
    echo "   DB wiped — seed data will be re-inserted on first request."
    ;;
  ""|--backend|-b)
    echo "⚡ Quick deploy (backend only, cached frontend)..."
    docker compose down
    docker compose up --build -d
    ;;
  *)
    echo "Usage: ./deploy.sh [--backend|-b] [--frontend|-f] [--full|-a] [--wipe|-w]"
    echo ""
    echo "  (no flag)     Backend-only changes (fast, uses cache)"
    echo "  --frontend -f Frontend changes (no-cache build + fresh dist volume)"
    echo "  --full     -a Full no-cache rebuild of everything"
    echo "  --wipe     -w Full rebuild + delete database (for schema changes)"
    exit 1
    ;;
esac

echo "✅ Deployed! Site is live on port 80."
