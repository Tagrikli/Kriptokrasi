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


(async () => {

    logger.info('Program starting...')
    logger.info(`USER: ${process.env.NODE_USER}`);


    //Load config parser for configuration
    const config = new ConfigParser();


    //Initialize database connection, prepare for process.
    const dbManager = new DatabaseManager();
    await dbManager.init();

    //Initialize Brain.
    const brain = new Brain(dbManager);
    await brain.updateOrders();

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
    const binanceManager = new BinanceManager(brain);
    binanceManager.bindOnBookTicker((data: any) => brain.onBinanceBookTicker(data));
    binanceManager.initSubscriptions();

    //Initialize and start express server.
    const expressApp = new ExpressApp(
        config.network.express_port,
        dbManager,
        brain,
        binanceManager)
    expressApp.bindWebhookCallback(telegramBot.webhookCallback);
    expressApp.start();



    //After initialization

    config.saveSession(session_string);



})();






// import './utils/config';                    //Loads config file
// import './TelegramClient/telegram_client';  //Runs telegram client
// import './TelegramBot/telegram_bot';        //Launches telegram bot
// import './ExpressApp/express_app';          //Starts express server
// import './BinanceAPI/main';                 //Binance API utils