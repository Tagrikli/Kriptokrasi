import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import input from 'input';
import { NewMessage, NewMessageEvent } from "telegram/events";
import { EntityLike } from "telegram/define";
import { Dialog } from "telegram/tl/custom/dialog";
import { logger } from "../Logger/logger";
import fs from 'fs';
import config from "../utils/config";


export default class TelegramApp {

    client: TelegramClient;

    constructor(api_id: number, api_hash: string, session_string: string) {

        this.client = new TelegramClient(new StringSession(session_string), api_id, api_hash, {
            autoReconnect: true,
            connectionRetries: 5,
            retryDelay: 1000
        });

    }

    async start() {

        await this.client.start({
            phoneNumber: async () => await input.text("Phone number: "),
            password: async () => await input.text("Password: "),
            phoneCode: async () => await input.text("Code: "),
            onError: (err) => console.log(err),
        });

        logger.info('Telegram Client started')
        this.saveSession();
    }

    saveSession() {
        let session_string = this.client.session.save() as unknown as string;
        let new_data = config.credentials;
        new_data.app.session = session_string;
        config.credentials = new_data
        config.saveConfig();
    }

    async getDialogByTitle(title: string) {


        let dialogs = await this.client.getDialogs({});
        let requested_dialog = dialogs.find(dialog => dialog.title === title);

        if (requested_dialog) {
            return requested_dialog;
        } else {
            logger.error('Dialog not found by title')
            return;
        }


    }

    addMessageHandler(dialog: Dialog, callback: (event: NewMessageEvent) => void) {
        this.client.addEventHandler(callback, new NewMessage({ chats: [dialog.entity.id] }))
        logger.info('Telegram Client binded a function');
    }


}


