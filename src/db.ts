import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "./db.types";

export default async function createDatabase(): Promise<Kysely<DB>> {
    if (dbCache === null) {
        dbCache = new Kysely<DB>({ dialect: dialect() });
    }
    return dbCache;
}
let dbCache: Kysely<DB> | null = null;

function dialect() {
    return new PostgresDialect({
        pool: new pg.Pool({
            host: "db",
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            max: 8
        })
    });
}
