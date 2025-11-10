#!/bin/bash

# Docker run script for Hasura Roles Management

set -e

echo "🚀 Starting Hasura Roles Management with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one with defaults..."
    echo "HASURA_ENDPOINT=https://hasura-test.mstart.local/v1/metadata" > .env
fi

# Check if running in dev mode
if [ "$1" == "dev" ]; then
    echo "📦 Starting in DEVELOPMENT mode..."
    docker-compose -f docker-compose.dev.yml up --build
elif [ "$1" == "build" ]; then
    echo "🔨 Building Docker images..."
    docker-compose build
elif [ "$1" == "up" ]; then
    echo "▶️  Starting containers..."
    docker-compose up -d
elif [ "$1" == "down" ]; then
    echo "🛑 Stopping containers..."
    docker-compose down
elif [ "$1" == "logs" ]; then
    echo "📋 Showing logs..."
    docker-compose logs -f
elif [ "$1" == "clean" ]; then
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
else
    echo "📦 Starting in PRODUCTION mode..."
    docker-compose up --build
fi

