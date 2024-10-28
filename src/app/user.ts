import { Elysia, t } from "elysia";
import { setup } from "./setup";

export const user = (config: {
    oauth: (telegram: string) => Promise<boolean>;
}) =>
    new Elysia()
        .use(setup)
        .get(
            "/whoami",
            ({ user, error }) => {
                if (!user) return error(401, "Unauthorized");
                return user.telegram;
            },
            { tags: ["user"] }
        )
        .post(
            "/login",
            async ({ db, cookie: { notes_token }, body, error }) => {
                let allow: boolean;
                try {
                    allow = await config.oauth(body.login);
                } catch {
                    allow = false;
                }
                if (allow) {
                    let user = await db
                        .selectFrom("user")
                        .select("token")
                        .where("telegram", "=", body.login)
                        .executeTakeFirst();

                    notes_token.value = user!.token;
                    notes_token.httpOnly = true;
                } else {
                    return error(401, "Unauthorized");
                }
            },
            {
                body: t.Object({
                    login: t.String()
                }),
                detail: { description: "Logout user", tags: ["user"] }
            }
        )
        .post(
            "/logout",
            ({ cookie: { notes_token } }) => {
                notes_token.remove();
            },
            {
                detail: { description: "Logout user", tags: ["user"] }
            }
        );