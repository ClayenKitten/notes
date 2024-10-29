import { Elysia, t } from "elysia";
import { setup } from "./setup";

const IdSchema = t.Object({ id: t.String({ format: "uuid" }) });

export const notes = new Elysia()
    .use(setup)
    .group("", app =>
        app
            .guard({
                detail: {
                    security: [{ bearerAuth: [] }]
                }
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
                    detail: {
                        summary: "Получить список записок",
                        tags: ["note"]
                    }
                }
            )
            .get(
                "/:id",
                async ({ db, user, params, error }) => {
                    let note = await db
                        .selectFrom("note")
                        .select(["id", "header", "content", "createdAt"])
                        .where("userId", "=", user.id)
                        .where("id", "=", params.id)
                        .executeTakeFirst();
                    if (!note) return error(404, "Not Found");
                    return note;
                },
                {
                    params: IdSchema,
                    detail: {
                        summary: "Получить записку по id",
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
                        summary: "Создать новую записку",
                        tags: ["note"]
                    }
                }
            )
            .put(
                "/:id",
                async ({
                    db,
                    user,
                    params,
                    body: { header, content },
                    error
                }) => {
                    let { numUpdatedRows } = await db
                        .updateTable("note")
                        .set({ userId: user.id, header, content })
                        .where("id", "=", params.id)
                        .where("userId", "=", user.id)
                        .executeTakeFirst();
                    if (numUpdatedRows === 0n) return error(404, "Not Found");
                },
                {
                    params: IdSchema,
                    body: t.Object({
                        header: t.String(),
                        content: t.String()
                    }),
                    detail: { summary: "Обновить записку", tags: ["note"] }
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
                    params: IdSchema,
                    detail: { summary: "Удалить записку", tags: ["note"] }
                }
            )
    )
    .group("/public", app =>
        app
            .get(
                "",
                async ({ db }) => {
                    return await db
                        .selectFrom("note")
                        .select(["id", "header", "createdAt"])
                        .where("userId", "is", null)
                        .execute();
                },
                {
                    detail: {
                        summary: "Получить список публичных записок",
                        tags: ["note"]
                    }
                }
            )
            .post(
                "",
                async ({ db, body: { content, header } }) => {
                    await db
                        .insertInto("note")
                        .values({ userId: null, header, content })
                        .executeTakeFirst();
                },
                {
                    body: t.Object({
                        header: t.String(),
                        content: t.String()
                    }),
                    detail: {
                        summary: "Создать новую публичную записку",
                        tags: ["note"]
                    }
                }
            )
            .get(
                "/:id",
                async ({ db, error, params }) => {
                    let note = await db
                        .selectFrom("note")
                        .select(["id", "header", "content", "createdAt"])
                        .where("userId", "is", null)
                        .where("id", "=", params.id)
                        .executeTakeFirst();
                    if (!note) error(404, "Not Found");
                    return note;
                },
                {
                    params: IdSchema,
                    detail: {
                        summary: "Получить публичную записку по id",
                        tags: ["note"]
                    }
                }
            )
    );
