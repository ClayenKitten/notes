import { Telegraf } from "telegraf";
import createApp from "./app";
import startBot from "./tg";

let { bot, oauth } = await startBot({ token: process.env.TG_BOT_TOKEN! });
let app = await createApp({ oauth });
app.listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
