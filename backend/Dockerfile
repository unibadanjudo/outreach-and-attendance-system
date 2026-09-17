# ==========================================
# Stage 1: Build & Compile
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy configuration and source files
COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/

# Compile TypeScript into dist/
RUN npm run build

# Remove development dependencies to prepare minimal production runtime
RUN npm prune --omit=dev

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl or wget for container health checks
RUN apk --no-cache add wget

# Use unprivileged 'node' user provided by official Alpine Node image
USER node

# Copy only the compiled application and production node_modules from the builder stage
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

# Health check to ensure service readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start production server
CMD ["node", "dist/main"]
