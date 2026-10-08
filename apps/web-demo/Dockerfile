# Production Dockerfile for Markup Public Web Demo Frontend
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies Stage
FROM base AS dependencies
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-demo/package.json ./apps/web-demo/
RUN pnpm install --frozen-lockfile

# Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web-demo/node_modules ./apps/web-demo/node_modules
COPY . .

ENV NODE_ENV=production
RUN pnpm --filter @headless/web-demo build

# Production Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app ./

USER nextjs
EXPOSE 3001

CMD ["pnpm", "--filter", "@headless/web-demo", "start"]
