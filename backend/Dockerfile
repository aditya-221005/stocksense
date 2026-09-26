# ──────────────────────────────────────────────
# Stage 1 — Dependencies
# ──────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# OpenSSL required by Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

# ──────────────────────────────────────────────
# Stage 2 — Build
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# OpenSSL required by Prisma generate
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before compiling TS
RUN npx prisma generate --schema=./prisma/schema.prisma

# Compile TypeScript → dist/
RUN npm run build

# ──────────────────────────────────────────────
# Stage 3 — Production runner (lean image)
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# OpenSSL required by Prisma client at runtime
RUN apk add --no-cache openssl

# Only copy what's needed at runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 5000

# NOTE: We use `prisma db push` (not `migrate deploy`) because this project
# uses schema-push workflow — no migration files exist.
# To skip schema sync on every restart, comment out the db push line.
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && node dist/server.js"]
