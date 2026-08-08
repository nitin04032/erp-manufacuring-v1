# erp-frontend Dockerfile — local dev / docker-compose use.
# Straightforward `next build` + `next start`, not Next's "standalone"
# output mode (next.config.mjs doesn't opt into it) — kept that way to
# avoid changing next.config.mjs's build behavior as a side effect of
# adding Docker support. Revisit for a leaner image later if needed.

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
# Needed at build time: apiClient.ts's getApiBaseUrl() reads
# NEXT_PUBLIC_API_URL, and Next.js inlines NEXT_PUBLIC_* vars at build
# time, not runtime. docker-compose.yml passes this as a build arg.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json next.config.mjs ./
EXPOSE 3000
CMD ["npm", "start"]
