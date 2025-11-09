# Docker Setup for Hasura Roles Management

This guide explains how to run the Hasura Roles Management application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### Production Build

1. **Build and run the client (React app):**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Client: http://localhost:3000
   - Server (if enabled): http://localhost:5000

### Development Mode

For development with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Access at: http://localhost:5173

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
HASURA_ENDPOINT=https://192.168.200.141/v1/metadata
HASURA_ADMIN_SECRET=myadminsecretkey
```

**Note:** These values are used during the Docker build process. For production, make sure to use secure values and never commit the `.env` file to version control.

### Client-Only Setup

If you only want to run the React client (recommended for this app):

**Using Docker Compose (Recommended):**
```bash
docker-compose up client --build
```

**Or using Docker directly:**
```bash
cd hasurarolesmanagement.client
docker build \
  --build-arg VITE_HASURA_ENDPOINT=https://192.168.200.141/v1/metadata \
  --build-arg VITE_HASURA_ADMIN_SECRET=myadminsecretkey \
  -t hasura-roles-client .
docker run -p 3000:80 hasura-roles-client
```

### Using Helper Scripts

**Windows:**
```cmd
docker-run.bat          # Production mode
docker-run.bat dev      # Development mode
docker-run.bat build    # Build only
docker-run.bat up       # Start in background
docker-run.bat down     # Stop containers
docker-run.bat logs     # View logs
docker-run.bat clean    # Clean up everything
```

**Linux/Mac:**
```bash
chmod +x docker-run.sh
./docker-run.sh          # Production mode
./docker-run.sh dev      # Development mode
./docker-run.sh build    # Build only
./docker-run.sh up       # Start in background
./docker-run.sh down     # Stop containers
./docker-run.sh logs     # View logs
./docker-run.sh clean    # Clean up everything
```

## Docker Commands

### Build only:
```bash
docker-compose build
```

### Run in background:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
```

### Stop containers:
```bash
docker-compose down
```

### Clean up (remove containers, networks, volumes):
```bash
docker-compose down -v
```

## Architecture

- **Client Service**: React/Vite application served via Nginx
- **Server Service**: ASP.NET Core backend (optional, currently not required)

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### CORS Issues
If you encounter CORS issues with Hasura, you may need to:
1. Configure Hasura to allow your domain
2. Use a reverse proxy
3. Update the Vite config to proxy requests

### Build Fails
- Ensure Docker has enough memory allocated (recommended: 4GB+)
- Clear Docker cache: `docker system prune -a`
- Check Docker logs: `docker-compose logs`

## Production Deployment

For production, consider:
1. Using environment-specific configuration
2. Setting up SSL/TLS certificates
3. Using a reverse proxy (nginx, traefik)
4. Setting resource limits in docker-compose.yml
5. Using Docker secrets for sensitive data

