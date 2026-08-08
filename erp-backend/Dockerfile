# erp-backend Dockerfile — local dev / docker-compose use.
# Multi-stage: install once, build once, run from a slim runtime image.
# Not yet optimized with Next-style "standalone" output tricks — kept
# straightforward so it's easy to verify against the app's real npm
# scripts (see package.json). Revisit for a leaner image once this is
# actually running somewhere that cares about image size.

FROM node:20-bookworm-slim AS deps
WORKDIR /app
# bcrypt/sqlite3 have native (node-gyp) install scripts — build tooling is
# needed at install time even though the runtime image doesn't need it.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
