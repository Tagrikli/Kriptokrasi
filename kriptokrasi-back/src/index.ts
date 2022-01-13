import dotenv from 'dotenv';
dotenv.config();

export const ROOT_PATH = __dirname;
import { logger } from './Logger/logger';

logger.info('Program starting...')
logger.info(`USER: ${process.env.NODE_USER}`);

import './Database/database';
import './utils/config';                    //Loads config file
import './TelegramClient/telegram_client';  //Runs telegram client
import './TelegramBot/telegram_bot';        //Launches telegram bot
import './ExpressApp/express_app';          //Starts express server
import './BinanceAPI/main';                 //Binance API utils