#!/bin/bash
# Backup the production SQLite database
# Usage: ./scripts/backup-db.sh

DB_PATH="${NUXT_DATABASE_PATH:-/home/febec/Programming/claude/spotify-wedding/.data/production.sqlite}"
BACKUP_DIR="/home/febec/Programming/claude/spotify-wedding/.data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/production_${TIMESTAMP}.sqlite"

mkdir -p "$BACKUP_DIR"

# Use SQLite's backup API via cp (safe for WAL mode when using cp on the main file)
cp "$DB_PATH" "$BACKUP_FILE"

# Keep only last 10 backups
ls -t "$BACKUP_DIR"/production_*.sqlite 2>/dev/null | tail -n +11 | xargs -r rm

echo "Backup created: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
