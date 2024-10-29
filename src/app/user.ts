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
                    security: [{ bearerAuth: [] }],
                    summary: "Получить Telegram username текущего пользователя",
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
                    summary: "Авторизовать пользователя по Telegram username",
                    description: [
                        "## Вход в аккаунт\n",
                        "После вызова этой ручки пользователю придёт сообщение от бота в Телеграм ",
                        "с кнопкой подтверждения входа. После этого сервер вернёт ответ, ",
                        "содержащий токен пользователя.\n",
                        "При использовании любых ручек, требующих авторизации, следует",
                        "передавать токен в заголовке `Authorization` в формате `Bearer ",
                        "{TOKEN}`, где `{TOKEN}` - значение токена, полученное из этой ручки.\n\n",
                        "**Внимание:** токен не перевыпускается и не изменяется",
                        "между входами в аккаунт. Держите его в секрете!\n",
                        "## Регистрация\n",
                        "Перед использованием этой ручки пользователь должен зарегистрироваться, написав боту команду `/start`.\n",
                        "## Ошибка входа\n",
                        "При ошибке входа сервер ответит кодом 401 через 5 минут.\n",
                        "### Возможные причины ошибок\n\n",
                        "- пользователь не существует\n\n",
                        "- пользователь не прошёл регистрацию\n\n",
                        "- пользователь не успел ответить на запрос.\n\n",
                        "В целях безопасности данных пользователей, ручка вернёт ошибку не ранее",
                        "чем через 5 минут независимо от причины ошибки."
                    ].join(" "),
                    tags: ["user"]
                }
            }
        );
