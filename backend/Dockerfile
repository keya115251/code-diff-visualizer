# Stage 1: install production dependencies.
# better-sqlite3 is a native module; build tools are only needed here as a
# fallback when no prebuilt binary matches, and never reach the final image.
FROM node:20-slim AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: minimal runtime image, running as the unprivileged "node" user
FROM node:20-slim AS runtime

ENV NODE_ENV=production \
    PORT=4000 \
    DB_PATH=/app/data/data.sqlite

WORKDIR /app

# Copy dependencies and source owned by root (read-only to the app user)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Only the data directory is writable by the app user (uid 1000)
RUN mkdir -p /app/data && chown node:node /app/data

USER node

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
