# Base image for the container
FROM node:20.19.5 AS build

# Set the working directory
WORKDIR /app/

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Copy the feedback widget package
COPY capslock-feedback-widget-1.0.0.tgz ./

# Remove lock file so it regenerates with correct checksum
RUN rm -f package-lock.json

# Install dependencies
RUN npm install --ignore-scripts.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY . /app

# Ensure TypeScript is installed and compile the project
RUN npm run build

FROM caddy:2.10.2-alpine
RUN apk add --no-cache ca-certificates

# Copy static files, verify Caddyfile formatting
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile

# Boilerplate, not used in OpenShift/Kubernetes
EXPOSE 5173 5174
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:5174/health

# Nonroot user
USER 1001
