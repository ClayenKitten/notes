import Elysia from "elysia";
import createDatabase from "../db";

export const setup = new Elysia({ name: "setup" })
    .decorate("db", await createDatabase())
    .resolve({ as: "scoped" }, async ({ cookie: { notes_token }, db }) => {
        if (!notes_token.value) {
            return { user: null };
        }
        let user = await db
            .selectFrom("user")
            .selectAll()
            .where("token", "=", notes_token.value)
            .executeTakeFirst();
        if (!user) {
            return { user: null };
        }
        return { user };
    });
