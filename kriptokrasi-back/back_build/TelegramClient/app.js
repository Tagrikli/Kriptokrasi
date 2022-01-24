"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const events_1 = require("telegram/events");
const input_1 = __importDefault(require("input"));
const logger_1 = __importDefault(require("../Logger/logger"));
class TelegramApp {
    client;
    constructor(api_id, api_hash, session_string) {
        this.client = new telegram_1.TelegramClient(new sessions_1.StringSession(session_string), api_id, api_hash, {
            autoReconnect: true,
            connectionRetries: 10,
            retryDelay: 5000,
        });
    }
    async start() {
        await this.client.start({
            phoneNumber: async () => await input_1.default.text("Phone number: "),
            password: async () => await input_1.default.text("Password: "),
            phoneCode: async () => await input_1.default.text("Code: "),
            onError: (err) => console.log(err),
        });
        logger_1.default.tele_app('Telegram Client started');
        return this.client.session.save();
    }
    // saveSession() {
    //     let session_string = this.client.session.save() as unknown as string;
    //     let new_data = config.credentials;
    //     new_data.app.session = session_string;
    //     config.credentials = new_data
    //     config.saveConfig();
    // }
    async getDialogByTitle(title) {
        let dialogs = await this.client.getDialogs({});
        let requested_dialog = dialogs.find(dialog => dialog.title === title);
        if (requested_dialog) {
            return requested_dialog;
        }
        else {
            logger_1.default.error('Dialog not found by title');
            return;
        }
    }
    async addMessageHandler(dialog_title, callback) {
        let dialog = await this.getDialogByTitle(dialog_title);
        if (dialog) {
            this.client.addEventHandler(callback, new events_1.NewMessage({ chats: [dialog.entity.id] }));
            logger_1.default.tele_app('Telegram Client binded a function');
        }
    }
}
exports.default = TelegramApp;
