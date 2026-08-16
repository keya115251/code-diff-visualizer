FROM node:20-slim

WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY src ./src

# Data directory for SQLite (mounted as a volume in docker-compose)
RUN mkdir -p /app/data
ENV DB_PATH=/app/data/data.sqlite

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
