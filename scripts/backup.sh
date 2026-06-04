#!/bin/bash
# ============================================================
# SICAMS - MySQL Backup Script
# Runs daily inside backup container
# ============================================================

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/sicams_backup_${DATE}.sql.gz"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  SICAMS Database Backup"
echo "📅 Date: $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create backup directory if not exists
mkdir -p "${BACKUP_DIR}"

# Wait for MySQL to be ready
until mysqladmin ping -h "${MYSQL_HOST}" -u "${MYSQL_USER}" -p"${MYSQL_PASSWORD}" --silent 2>/dev/null; do
    echo "⏳ Waiting for MySQL..."
    sleep 5
done

# Perform backup
echo "⚙️  Creating backup: ${BACKUP_FILE}"
mysqldump \
    -h "${MYSQL_HOST}" \
    -u "${MYSQL_USER}" \
    -p"${MYSQL_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --set-gtid-purged=OFF \
    "${MYSQL_DATABASE}" | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup successful: ${BACKUP_FILE} (${SIZE})"
else
    echo "❌ Backup FAILED!"
    exit 1
fi

# Remove old backups (older than retention days)
echo "🧹 Cleaning backups older than ${BACKUP_RETENTION_DAYS:-7} days..."
find "${BACKUP_DIR}" -name "sicams_backup_*.sql.gz" -mtime +${BACKUP_RETENTION_DAYS:-7} -delete

# List current backups
echo ""
echo "📦 Current backups:"
ls -lh "${BACKUP_DIR}"/sicams_backup_*.sql.gz 2>/dev/null || echo "No backups found"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
