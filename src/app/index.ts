import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { notes } from "./note";
import { setup } from "./setup";
import { user } from "./user";

export default async function createApp({
    oauth
}: {
    oauth: (login: string) => Promise<boolean>;
}) {
    return new Elysia()
        .use(cors())
        .use(
            swagger({
                provider: "swagger-ui",
                documentation: {
                    info: {
                        title: "Notes app",
                        description:
                            "Приложение для ведения записок с аутентификацией через Telegram.",
                        version
                    },
                    tags: [
                        {
                            name: "user",
                            description: "Аутентификация пользователей"
                        },
                        { name: "note", description: "Управление записками" },
                        { name: "misc", description: "Прочее" }
                    ],
                    components: {
                        securitySchemes: {
                            bearerAuth: {
                                type: "http",
                                scheme: "bearer"
                            }
                        }
                    }
                }
            })
        )
        .use(setup)
        .get("/", ({ set }) => {
            set.headers["content-type"] = "text/html; charset=utf-8";
            return `Привет! Открой путь <a href="/swagger">/swagger</a>, чтобы увидеть документацию по использованию API.<br/><br/><img src="https://http.cat/images/200.jpg" height=400 />`;
        })
        .group("user", app => app.use(user({ oauth })))
        .group("note", app => app.use(notes))
        .get(
            "/version",
            () => {
                return version;
            },
            {
                detail: {
                    description: "Get application version",
                    tags: ["misc"]
                }
            }
        );
}

const version = process.env.npm_package_version!;
