import { Telegraf } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import createDatabase from "./db";

export default async function startBot({ token }: { token: string }) {
    const db = await createDatabase();

    const bot = new Telegraf(token);
    bot.start(async ctx => {
        let username = ctx.from.username;
        if (!username) {
            return await ctx.reply(
                "Для использования бота нужно установить никнейм в настройках Telegram."
            );
        }
        const result = await db
            .insertInto("user")
            .values({
                telegram: username,
                token: crypto.randomUUID(),
                chatId: ctx.chat.id.toString()
            })
            .onConflict(conflict => conflict.column("telegram").doNothing())
            .executeTakeFirst();
        if (result.numInsertedOrUpdatedRows === 0n) {
            return await ctx.reply(
                "Ты уже зарегистрирован(а)! Можешь авторизоваться на сайте."
            );
        } else {
            return await ctx.reply(
                "Регистрация успешна! Теперь можешь авторизоваться на сайте и начать использовать свои заметки."
            );
        }
    });
    bot.on(callbackQuery("data"), async tg => {
        let callback = waiting.get(tg.chat!.id.toString());
        if (callback) {
            tg.editMessageText("Вход подтверждён");
            callback();
        } else {
            tg.editMessageText("Срок подтверждения истёк");
        }
        tg.answerCbQuery();
    });

    bot.launch();

    return {
        bot,
        async oauth(telegram: string): Promise<boolean> {
            let response = await db
                .selectFrom("user")
                .select("chatId")
                .where("telegram", "=", telegram)
                .executeTakeFirst();
            if (!response)
                return new Promise((_, reject) => setTimeout(reject, timeout));
            let { chatId } = response;

            try {
                let message = await bot.telegram.sendMessage(
                    chatId,
                    [
                        "Это ты пытаешься войти в заметки?",
                        "Если это не ты, то можешь проигнорировать данное сообщение.",
                        `Запрос действует 5 минут.`
                    ].join("\n\n"),
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Да", callback_data: "yes" }]
                            ]
                        }
                    }
                );
            } catch {
                return new Promise((_, reject) => setTimeout(reject, timeout));
            }
            return new Promise((resolve, reject) => {
                let cancelTimeoutId = setTimeout(() => {
                    waiting.delete(chatId);
                    reject();
                }, timeout);
                waiting.set(chatId, () => {
                    waiting.delete(chatId);
                    clearTimeout(cancelTimeoutId);
                    resolve(true);
                });
            });
        }
    };
}

const timeout = 5 * 60 * 1000;
const waiting = new Map<string, () => void>();
