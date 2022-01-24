"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOT_PATH = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ROOT_PATH = __dirname;
const logger_1 = __importDefault(require("./Logger/logger"));
const config_1 = __importDefault(require("./utils/config"));
const database_1 = __importDefault(require("./Database/database"));
const app_1 = __importDefault(require("./TelegramClient/app"));
const telegram_bot_1 = __importDefault(require("./TelegramBot/telegram_bot"));
const main_1 = __importDefault(require("./BinanceAPI/main"));
const main_2 = __importDefault(require("./Brain/main"));
const express_app_1 = __importDefault(require("./ExpressApp/express_app"));
const network_json_1 = __importDefault(require("./kriptokrasi-common/network.json"));
const notifier_1 = __importDefault(require("./Notifier/notifier"));
(async () => {
    logger_1.default.info('Program starting...');
    logger_1.default.info(`USER: ${process.env.NODE_USER}`);
    //Load config parser for configuration
    const config = new config_1.default();
    const notifier = new notifier_1.default();
    //Initialize database connection, prepare for process.
    const dbManager = new database_1.default();
    await dbManager.init();
    //Initialize Telegram app and acquire relevant session string.
    const telegramApp = new app_1.default(config.credentials.app.api_id, config.credentials.app.api_hash, config.credentials.app.session);
    const session_string = await telegramApp.start();
    //Initialize and start telegram bot.
    const telegramBot = new telegram_bot_1.default(config.credentials.bot.token, dbManager, notifier);
    await telegramBot.start();
    //Initialize binance.
    const binanceManager = new main_1.default();
    //Initialize Brain.
    const brain = new main_2.default(dbManager, telegramBot, binanceManager, notifier);
    await brain.updateOrders();
    //Initialize and start express server.
    const expressApp = new express_app_1.default(network_json_1.default.PORT, dbManager, brain, binanceManager, telegramBot, notifier);
    expressApp.bindWebhookCallback(telegramBot.webhookCallback);
    expressApp.start();
    //Initialize Notifier
    //After initialization
    telegramApp.addMessageHandler('CryptoMeter.io Bot', (data) => brain.onTelegramAppMessage(data));
    notifier.binance = binanceManager;
    notifier.database = dbManager;
    if (process.env.LIVE_PRICE === 'y') {
        binanceManager.bindOnBookTicker((data) => brain.onBinanceBookTicker(data));
        binanceManager.initSubscriptions();
    }
    else {
        expressApp.bindDevLivePrice((data) => brain.onBinanceBookTicker(data));
    }
    config.saveSession(session_string);
})();
