#!/bin/bash
set -e

# Detect docker compose or docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "Error: Docker Compose is not installed. Please install Docker and Docker Compose."
    exit 1
fi

# Load default APP_PORT from .env if present
ENV_PORT=""
if [ -f .env ]; then
    ENV_PORT=$(grep -E '^[[:space:]]*APP_PORT=' .env | cut -d '=' -f2 | tr -d ' "\r' || true)
fi

PORT_ARG=""
INTERACTIVE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -p|--port)
            PORT_ARG="$2"
            shift 2
            ;;
        -i|--interactive)
            INTERACTIVE=true
            shift
            ;;
        -h|--help)
            echo "Usage: ./start.sh [PORT] [OPTIONS]"
            echo ""
            echo "Examples:"
            echo "  ./start.sh              # Start with default port (8080 or value in .env)"
            echo "  ./start.sh 9090         # Start on port 9090"
            echo "  ./start.sh -p 9090      # Start on port 9090"
            echo "  ./start.sh -i           # Prompt interactively for port"
            echo ""
            echo "Options:"
            echo "  [PORT]               Port number to expose on host"
            echo "  -p, --port <PORT>    Port number to expose on host"
            echo "  -i, --interactive    Prompt interactively for port"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  APP_PORT=<PORT>      Set the application port (or define in .env)"
            exit 0
            ;;
        *)
            if [[ "$1" =~ ^[0-9]+$ ]]; then
                PORT_ARG="$1"
            else
                echo "Warning: Unrecognized argument '$1' ignored."
            fi
            shift
            ;;
    esac
done

DEFAULT_PORT="${ENV_PORT:-8080}"

# If interactive mode requested, prompt the user
if [ "$INTERACTIVE" = true ]; then
    read -r -p "Enter port for Task Manager [default: ${DEFAULT_PORT}]: " USER_INPUT_PORT
    if [ -n "$USER_INPUT_PORT" ]; then
        PORT_ARG="$USER_INPUT_PORT"
    fi
fi

# Precedence: CLI argument > APP_PORT env > PORT env > .env file > default 8080
export APP_PORT="${PORT_ARG:-${APP_PORT:-${PORT:-${DEFAULT_PORT}}}}"

# Validate port number
if ! [[ "$APP_PORT" =~ ^[0-9]+$ ]] || [ "$APP_PORT" -lt 1 ] || [ "$APP_PORT" -gt 65535 ]; then
    echo "Error: Invalid port '$APP_PORT'. Port must be a number between 1 and 65535."
    exit 1
fi

echo "Starting Task Manager services (PostgreSQL, Redis, App on port ${APP_PORT})..."
$COMPOSE_CMD up -d --build

echo "======================================================"
echo " Task Manager is up and running!"
echo " Open http://localhost:${APP_PORT} in your browser to test."
echo " To view application logs: $COMPOSE_CMD logs -f app"
echo " To stop all services: ./stop.sh"
echo "======================================================"
