import { Elysia, t } from "elysia";
import { setup } from "./setup";

export const notes = new Elysia()
    .use(setup)
    .guard({
        headers: t.Object({
            Authorization: t.String()
        })
    })
    .resolve(({ user, error }) => {
        if (!user) return error(401, "Unauthorized");
        return { user };
    })
    .get(
        "",
        async ({ db, user }) => {
            return await db
                .selectFrom("note")
                .select(["id", "header", "createdAt"])
                .where("userId", "=", user.id)
                .execute();
        },
        {
            detail: { description: "Get note list", tags: ["note"] }
        }
    )
    .get(
        "/:id",
        async ({ db, user, params, error }) => {
            let note = await db
                .selectFrom("note")
                .selectAll()
                .where("userId", "=", user.id)
                .where("id", "=", params.id)
                .executeTakeFirst();
            if (!note) return error(404, "Not Found");
            return note;
        },
        {
            detail: {
                description: "Get specific note",
                tags: ["note"]
            }
        }
    )
    .post(
        "",
        async ({ db, user, body: { content, header } }) => {
            await db
                .insertInto("note")
                .values({ userId: user.id, header, content })
                .executeTakeFirst();
        },
        {
            body: t.Object({
                header: t.String(),
                content: t.String()
            }),
            detail: {
                description: "Create new note",
                tags: ["note"]
            }
        }
    )
    .put(
        "/:id",
        async ({ db, user, params, body: { header, content }, error }) => {
            let { numUpdatedRows } = await db
                .updateTable("note")
                .set({ userId: user.id, header, content })
                .where("id", "=", params.id)
                .where("userId", "=", user.id)
                .executeTakeFirst();
            if (numUpdatedRows === 0n) return error(404, "Not Found");
        },
        {
            params: t.Object({
                id: t.String({ format: "uuid" })
            }),
            body: t.Object({
                header: t.String(),
                content: t.String()
            }),
            detail: { description: "Update note", tags: ["note"] }
        }
    )
    .delete(
        "/:id",
        async ({ db, user, params, error }) => {
            let { numDeletedRows } = await db
                .deleteFrom("note")
                .where("id", "=", params.id)
                .where("userId", "=", user.id)
                .executeTakeFirst();
            if (numDeletedRows === 0n) return error(404, "Not Found");
        },
        {
            params: t.Object({
                id: t.String({ format: "uuid" })
            }),
            detail: { description: "Delete note", tags: ["note"] }
        }
    );
