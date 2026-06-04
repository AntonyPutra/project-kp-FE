#!/bin/bash
# ============================================================
# SICAMS - Deployment Script
# Server: Ubuntu + Docker + Cloudflare Tunnel
# ============================================================

set -e

# ── Colors ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Config ─────────────────────────────────────────────────
PROJECT_NAME="sicams"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.server"
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}
APP_VERSION=$(date +%Y%m%d.%H%M%S)

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
section() { echo -e "\n${CYAN}${BOLD}━━━ $1 ━━━${NC}\n"; }

# ── Checks ─────────────────────────────────────────────────
check_requirements() {
    section "Pre-deployment Checks"
    
    command -v docker >/dev/null 2>&1 || error "Docker tidak ditemukan!"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose tidak ditemukan!"
    
    [ -f "$COMPOSE_FILE" ] || error "File $COMPOSE_FILE tidak ditemukan!"
    [ -f "$ENV_FILE" ] || error "File $ENV_FILE tidak ditemukan! Salin dari .env.server.example"
    
    log "✅ Docker: $(docker --version)"
    log "✅ Docker Compose: $(docker-compose --version)"
    log "✅ File konfigurasi lengkap"
}

# ── Backup ─────────────────────────────────────────────────
backup_database() {
    if [ "$BACKUP_BEFORE_DEPLOY" != "true" ]; then
        warn "Backup dilewati (BACKUP_BEFORE_DEPLOY=false)"
        return
    fi
    
    section "Database Backup"
    
    if docker ps --format '{{.Names}}' | grep -q "sicams_mysql"; then
        log "📦 Membuat backup database sebelum deploy..."
        mkdir -p ./backups
        
        BACKUP_FILE="./backups/pre_deploy_$(date +%Y%m%d_%H%M%S).sql.gz"
        source "$ENV_FILE"
        
        docker exec sicams_mysql mysqldump \
            -u "${DB_USERNAME:-sicams_user}" \
            -p"${DB_PASSWORD}" \
            --single-transaction \
            "${DB_DATABASE:-sicams_production}" | gzip > "$BACKUP_FILE"
        
        log "✅ Backup tersimpan: $BACKUP_FILE ($(du -sh $BACKUP_FILE | cut -f1))"
    else
        warn "Container MySQL belum berjalan, backup dilewati"
    fi
}

# ── Network ────────────────────────────────────────────────
setup_network() {
    section "Docker Network Setup"
    
    if ! docker network inspect proxy_network >/dev/null 2>&1; then
        log "🌐 Membuat proxy_network..."
        docker network create proxy_network
        log "✅ proxy_network berhasil dibuat"
    else
        log "✅ proxy_network sudah ada"
    fi
}

# ── Build ──────────────────────────────────────────────────
build_images() {
    section "Building Docker Images"
    
    log "🔨 Building frontend image..."
    APP_VERSION="$APP_VERSION" docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build frontend
    
    log "🔨 Building backend image..."
    APP_VERSION="$APP_VERSION" docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build backend
    
    log "✅ Build selesai"
}

# ── Deploy ─────────────────────────────────────────────────
deploy_services() {
    section "Deploying Services"
    
    log "🚀 Memulai services (infra terlebih dahulu)..."
    
    # Start infrastructure first
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d mysql redis
    
    log "⏳ Menunggu database siap (30 detik)..."
    sleep 30
    
    # Run migrations
    log "🗃️  Menjalankan database migrations..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend \
        php artisan migrate --force --no-interaction
    
    log "🌱 Menjalankan database seeder (jika pertama kali)..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend \
        php artisan db:seed --class=InitialDataSeeder --no-interaction 2>/dev/null || true
    
    # Deploy main services
    log "🚀 Memulai semua services..."
    APP_VERSION="$APP_VERSION" docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    log "✅ Semua services berjalan"
}

# ── Health Check ───────────────────────────────────────────
health_check() {
    section "Health Check"
    
    log "⏳ Menunggu services siap (30 detik)..."
    sleep 30
    
    # Check frontend
    if curl -sf http://localhost:5173/health >/dev/null 2>&1; then
        log "✅ Frontend: http://localhost:5173 - OK"
    else
        warn "⚠️  Frontend belum merespons"
    fi
    
    # Check backend
    if curl -sf http://localhost:8000/api/health >/dev/null 2>&1; then
        log "✅ Backend: http://localhost:8000 - OK"
    else
        warn "⚠️  Backend belum merespons"
    fi
    
    # Container status
    echo ""
    log "📊 Status containers:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# ── Main ───────────────────────────────────────────────────
main() {
    echo -e "\n${BOLD}${BLUE}"
    echo "  ███████╗██╗ ██████╗ █████╗ ███╗   ███╗███████╗"
    echo "  ██╔════╝██║██╔════╝██╔══██╗████╗ ████║██╔════╝"
    echo "  ███████╗██║██║     ███████║██╔████╔██║███████╗"
    echo "  ╚════██║██║██║     ██╔══██║██║╚██╔╝██║╚════██║"
    echo "  ███████║██║╚██████╗██║  ██║██║ ╚═╝ ██║███████║"
    echo "  ╚══════╝╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝"
    echo -e "${NC}"
    echo -e "  ${CYAN}Smart Integrated Community & Asset Management System${NC}"
    echo -e "  ${YELLOW}Version: $APP_VERSION${NC}\n"
    
    check_requirements
    backup_database
    setup_network
    build_images
    deploy_services
    health_check
    
    section "Deployment Selesai!"
    echo -e "  ${GREEN}✅ Frontend:${NC} https://sicams.whaleestudio.my.id"
    echo -e "  ${GREEN}✅ Backend:${NC}  https://api.whaleestudio.my.id"
    echo -e "  ${GREEN}✅ Adminer:${NC}  http://192.168.1.3:9090 (internal)"
    echo ""
    echo -e "  ${CYAN}Untuk melihat logs:${NC}"
    echo -e "  docker-compose -f $COMPOSE_FILE logs -f [service_name]"
    echo ""
}

# Execute based on argument
case "${1:-deploy}" in
    deploy)     main ;;
    rollback)   section "Rollback"; docker-compose -f "$COMPOSE_FILE" down; warn "Manual rollback: restore dari backup dan jalankan ulang deploy" ;;
    status)     docker-compose -f "$COMPOSE_FILE" ps ;;
    logs)       docker-compose -f "$COMPOSE_FILE" logs -f --tail=100 "${2:-}" ;;
    stop)       docker-compose -f "$COMPOSE_FILE" stop ;;
    restart)    docker-compose -f "$COMPOSE_FILE" restart "${2:-}" ;;
    shell)      docker exec -it "sicams_${2:-backend}" /bin/sh ;;
    backup)     BACKUP_BEFORE_DEPLOY=true backup_database ;;
    *)          echo "Usage: $0 {deploy|rollback|status|logs|stop|restart|shell|backup}" ;;
esac
