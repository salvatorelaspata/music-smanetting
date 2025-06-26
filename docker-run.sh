#!/bin/bash

# Script per gestire l'applicazione Music Scanner dockerizzata

set -e

# Colori per l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Funzione per mostrare l'help
show_help() {
    echo "🎼 Music Scanner - Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build              Build all Docker images"
    echo "  up                 Start all services (production)"
    echo "  dev                Start all services (development)"
    echo "  down               Stop all services"
    echo "  logs               Show logs for all services"
    echo "  logs-frontend      Show logs for frontend service"
    echo "  logs-processing    Show logs for processing service"
    echo "  clean              Clean up containers, networks, and volumes"
    echo "  status             Show status of all services"
    echo "  restart            Restart all services"
    echo "  shell-frontend     Open shell in frontend container"
    echo "  shell-processing   Open shell in processing container"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build          # Build all images"
    echo "  $0 up             # Start in production mode"
    echo "  $0 dev            # Start in development mode"
    echo "  $0 logs           # View all logs"
}

# Funzione per verificare se Docker è installato
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker non è installato. Installa Docker per continuare."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose non è installato. Installa Docker Compose per continuare."
        exit 1
    fi
}

# Funzione per build
build() {
    print_info "Building Docker images..."
    docker-compose build --no-cache
    print_success "Build completata!"
}

# Funzione per avviare in produzione
up() {
    print_info "Starting services in production mode..."
    docker-compose up -d
    print_success "Services started!"
    print_info "Frontend: http://localhost:3000"
    print_info "Processing API: http://localhost:5001"
}

# Funzione per avviare in sviluppo
dev() {
    print_info "Starting services in development mode..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development services started!"
    print_info "Frontend: http://localhost:3000"
    print_info "Processing API: http://localhost:5001"
}

# Funzione per fermare i servizi
down() {
    print_info "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    print_success "All services stopped!"
}

# Funzione per mostrare i logs
logs() {
    docker-compose logs -f
}

logs_frontend() {
    docker-compose logs -f frontend
}

logs_processing() {
    docker-compose logs -f processing
}

# Funzione per pulire tutto
clean() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Funzione per mostrare lo status
status() {
    print_info "Docker containers status:"
    docker-compose ps
}

# Funzione per restart
restart() {
    print_info "Restarting all services..."
    docker-compose restart
    print_success "Services restarted!"
}

# Funzioni per aprire shell nei container
shell_frontend() {
    print_info "Opening shell in frontend container..."
    docker-compose exec frontend /bin/sh
}

shell_processing() {
    print_info "Opening shell in processing container..."
    docker-compose exec processing /bin/bash
}

# Main script logic
main() {
    check_docker

    case "${1:-help}" in
        build)
            build
            ;;
        up)
            up
            ;;
        dev)
            dev
            ;;
        down)
            down
            ;;
        logs)
            logs
            ;;
        logs-frontend)
            logs_frontend
            ;;
        logs-processing)
            logs_processing
            ;;
        clean)
            clean
            ;;
        status)
            status
            ;;
        restart)
            restart
            ;;
        shell-frontend)
            shell_frontend
            ;;
        shell-processing)
            shell_processing
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
