FROM oven/bun:1.1-alpine AS builder

WORKDIR /app
COPY package.json .
COPY bun.lockb .
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.1-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
CMD ["bun", "./dist"]
