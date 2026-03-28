FROM oven/bun:1.3-alpine AS base

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production=false

# --- Build the app ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build
# Flatten the nested standalone output (turbopack.root causes nesting)
RUN mv .next/standalone/$(ls .next/standalone)/* .next/standalone/ 2>/dev/null || true

# --- Production image ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
