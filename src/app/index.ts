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
                    security: [{ bearerAuth: [] }],
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
