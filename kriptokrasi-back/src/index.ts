import dotenv from 'dotenv';
dotenv.config();

export const ROOT_PATH = __dirname;
import logger from './Logger/logger';

import ConfigParser from './utils/config';
import DatabaseManager from './Database/database';
import TelegramApp from './TelegramClient/app';
import TelegramBot from './TelegramBot/telegram_bot';
import BinanceManager from './BinanceAPI/main';
import Brain from './Brain/main';
import ExpressApp from './ExpressApp/express_app';
import NETWORK from './kriptokrasi-common/network.json';
import Notifier from './Notifier/notifier';
import { NotFoundError } from 'telegram/errors';


(async () => {

    logger.info('Program starting...')
    logger.info(`USER: ${process.env.NODE_USER}`);


    //Load config parser for configuration
    const config = new ConfigParser();


    //Initialize database connection, prepare for process.
    const dbManager = new DatabaseManager();
    await dbManager.init();

    //Initialize Telegram app and acquire relevant session string.
    const telegramApp = new TelegramApp(
        config.credentials.app.api_id,
        config.credentials.app.api_hash,
        config.credentials.app.session);
    const session_string = await telegramApp.start();

    //Initialize and start telegram bot.
    const telegramBot = new TelegramBot(config.credentials.bot.token, dbManager);
    await telegramBot.start();



    //Initialize binance.
    const binanceManager = new BinanceManager();




    //Initialize Brain.
    const brain = new Brain(dbManager, telegramBot, binanceManager);
    await brain.updateOrders();


    //Initialize and start express server.
    const expressApp = new ExpressApp(
        NETWORK.PORT,
        dbManager,
        brain,
        binanceManager,
        telegramBot)
    expressApp.bindWebhookCallback(telegramBot.webhookCallback);
    expressApp.start();


    //Initialize Notifier

    const notifier = new Notifier();


    //After initialization




    notifier.binance = binanceManager;
    notifier.database = dbManager;

    telegramBot.notifier = notifier;

    binanceManager.bindOnBookTicker((data: any) => brain.onBinanceBookTicker(data));
    binanceManager.initSubscriptions();

    config.saveSession(session_string);



})();