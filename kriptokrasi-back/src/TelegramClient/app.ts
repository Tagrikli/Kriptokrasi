import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent } from "telegram/events";
import { Dialog } from "telegram/tl/custom/dialog";
import input from 'input';
import logger from "../Logger/logger";


class TelegramApp {

    client: TelegramClient;

    constructor(api_id: number, api_hash: string, session_string: string) {

        this.client = new TelegramClient(new StringSession(session_string), api_id, api_hash, {
            autoReconnect: true,
            connectionRetries: 10,
            retryDelay: 5000,
        });


    }

    async start() {

        await this.client.start({
            phoneNumber: async () => await input.text("Phone number: "),
            password: async () => await input.text("Password: "),
            phoneCode: async () => await input.text("Code: "),
            onError: (err) => console.log(err),
        });

        logger.tele_app('Telegram Client started');



        return this.client.session.save() as unknown as string;


    }

    // saveSession() {
    //     let session_string = this.client.session.save() as unknown as string;
    //     let new_data = config.credentials;
    //     new_data.app.session = session_string;
    //     config.credentials = new_data
    //     config.saveConfig();
    // }

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

    async addMessageHandler(dialog_title: string, callback: (event: NewMessageEvent) => void) {

        let dialog = await this.getDialogByTitle(dialog_title);


        if (dialog) {
            this.client.addEventHandler(callback, new NewMessage({ chats: [dialog.entity.id] }))
            logger.tele_app('Telegram Client binded a function');
        }      
    }


    

}


export default TelegramApp;