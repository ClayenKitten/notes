import Elysia from "elysia";
import createDatabase from "../db";

export const setup = new Elysia({ name: "setup" })
    .decorate("db", await createDatabase())
    .resolve({ as: "scoped" }, async ({ headers, db }) => {
        if (!headers["Authorization"]) {
            return { user: null };
        }
        let user = await db
            .selectFrom("user")
            .selectAll()
            .where("token", "=", headers["Authorization"])
            .executeTakeFirst();
        if (!user) {
            return { user: null };
        }
        return { user };
    });
