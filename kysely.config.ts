import pg from "pg";
import { PostgresDialect } from "kysely";
import { defineConfig } from "kysely-ctl";

export default defineConfig({
    dialect: new PostgresDialect({
        pool: new pg.Pool({
            host: "db",
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            max: 8
        })
    }),
    migrations: {
        migrationFolder: "./migrations"
    }
});
