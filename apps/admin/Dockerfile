# Production Dockerfile for Markup Unified CMS & Web Platform
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies Stage
FROM base AS dependencies
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/database/package.json ./packages/database/
COPY apps/admin/package.json ./apps/admin/
RUN pnpm install --frozen-lockfile

# Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=dependencies /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=dependencies /app/apps/admin/node_modules ./apps/admin/node_modules
COPY . .

ENV NODE_ENV=production
RUN pnpm db:generate
RUN pnpm --filter @headless/database build
RUN pnpm --filter @headless/admin build

# Production Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app ./

USER nextjs
EXPOSE 3000

CMD ["pnpm", "--filter", "@headless/admin", "start"]
