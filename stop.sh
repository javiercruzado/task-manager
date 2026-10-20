#!/bin/bash

# Detect docker compose or docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "Error: Docker Compose is not installed."
    exit 1
fi

echo "Stopping Task Manager services..."
$COMPOSE_CMD down
echo "All services stopped."
