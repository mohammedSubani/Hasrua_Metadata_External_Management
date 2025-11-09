@echo off
REM Docker run script for Hasura Roles Management (Windows)

echo 🚀 Starting Hasura Roles Management with Docker...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found. Creating one with defaults...
    echo HASURA_ENDPOINT=https://hasura-test.mstart.local/v1/metadata > .env
)

REM Check command argument
if "%1"=="dev" (
    echo 📦 Starting in DEVELOPMENT mode...
    docker-compose -f docker-compose.dev.yml up --build
) else if "%1"=="build" (
    echo 🔨 Building Docker images...
    docker-compose build
) else if "%1"=="up" (
    echo ▶️  Starting containers...
    docker-compose up -d
) else if "%1"=="down" (
    echo 🛑 Stopping containers...
    docker-compose down
) else if "%1"=="logs" (
    echo 📋 Showing logs...
    docker-compose logs -f
) else if "%1"=="clean" (
    echo 🧹 Cleaning up Docker resources...
    docker-compose down -v
    docker system prune -f
) else (
    echo 📦 Starting in PRODUCTION mode...
    docker-compose up --build
)

