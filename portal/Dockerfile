# Builder: oven/bun uses JavaScriptCore (not V8), avoiding TurboFan JIT crashes
# that affect Node.js 20/22 during Next.js builds in Docker.
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY backoffice/package.json ./backoffice/
COPY portal/package.json ./portal/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/utils/package.json ./packages/utils/

RUN bun install --frozen-lockfile

COPY packages/ ./packages/
COPY portal/ ./portal/

ARG NEXT_PUBLIC_API_URL

WORKDIR /app/portal
RUN bun run build


# Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/portal/.next/standalone ./
COPY --from=builder /app/portal/.next/static ./portal/.next/static
COPY --from=builder /app/portal/public ./portal/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "portal/server.js"]
