# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build arguments for environment variables
ARG VITE_HASURA_ENDPOINT
ARG VITE_HASURA_ADMIN_SECRET

# Set environment variables for build
ENV VITE_HASURA_ENDPOINT=$VITE_HASURA_ENDPOINT
ENV VITE_HASURA_ADMIN_SECRET=$VITE_HASURA_ADMIN_SECRET

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

