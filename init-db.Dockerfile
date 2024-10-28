FROM oven/bun:1.1-alpine

WORKDIR /app

COPY ./package.json .
COPY ./bun.lockb .
COPY ./kysely.config.ts .
COPY ./migrations ./migrations

RUN bun install --frozen-lockfile
ENTRYPOINT ["bun", "run", "db", "migrate", "latest", "--", "--all"]
