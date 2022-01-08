import { NewMessageEvent } from "telegram/events";
import { bot } from "../TelegramBot/telegram_bot";
import { dbManager } from "../Database/database";
import TelegramApp from "./app";
import config from "../utils/config";
import { logger } from "../Logger/logger";


const app = new TelegramApp(
    config.credentials.app.api_id,
    config.credentials.app.api_hash,
    config.credentials.app.session);


app.start().then(() => {
    app.getDialogByTitle('CryptoMeter.io Bot').then((dialog) => {
        app.addMessageHandler(dialog, sendMessage);

    });
});

async function sendMessage(event: NewMessageEvent) {

    const message = event.message.message;
    let vipUsers = await dbManager.getAllVipUsers(true);

    for (let i = 0; i < vipUsers.length; i++) {
        bot.telegram.sendMessage(vipUsers[i].user_id, message);
    }

}