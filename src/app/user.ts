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
            {
                detail: {
                    description:
                        "Получить Telegram username текущего пользователя",
                    tags: ["user"]
                }
            }
        )
        .post(
            "/login",
            async ({ db, body, error }) => {
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
                    if (!user) return error(401, "Unauthorized");
                    return { token: user.token };
                } else {
                    return error(401, "Unauthorized");
                }
            },
            {
                body: t.Object({
                    login: t.String()
                }),
                detail: {
                    description: [
                        "Авторизовать пользователя по Telegram username.",
                        "Пользователь должен сначала зарегистрироваться через бота."
                    ].join(" "),
                    tags: ["user"]
                }
            }
        );
