import { Telegraf } from "telegraf";
import { getBitmexLiq, getBtcLiq, getCurrentLS, getDailyVolume, getHourlyVolume, getIndicator, getLiveTrade, getLongShort, getMergedVolume, getOhlcv, getOpenInterest, getRapidMov, getTickerList, getTotalLiq, getTradeVol24h, getTrendInd, getVolFlow, getXTrade } from "./bot_functions";
import DatabaseManager from "../Database/database";
import { BUTTON_LIST, HELP_TEXT, trade_egitimi, vadeli_egitimi, OKUDUM_ANLADIM } from "../keyboards/consts";
import { KEYBOARDS } from "../keyboards/keyboards";
import { Queries } from "../Query";
import { PROC_CONTEXT, TContext } from "../utils/types";
import { waitlist } from "../Waitlist";
import logger from "../Logger/logger";
import BinanceManager from "../BinanceAPI/main";
import { TOrder, EStatus, TOrder_Past } from '../kriptokrasi-common/order_types';
import Notifier from "../Notifier/notifier";
import { replace, StringNullableChain } from "lodash";


class TelegramBot {
    bot: Telegraf<TContext>
    db: DatabaseManager;
    notifier: Notifier;

    constructor(token: string, db: DatabaseManager, notifier:Notifier) {
        this.bot = new Telegraf<TContext>(token);
        this.db = db;
        this.notifier = notifier;
        this.registerCallbacks();
    }

    async webhookCallback(message: string) {
        try {

            const users = await this.db.getAllUsers(true, true);
            users.forEach(async user => this.bot.telegram.sendMessage(user.user_id, message));

        } catch (reason) {
            logger.error(reason);
        }
    }


    async sendMessageToAll(vip: boolean, filter: boolean, message: string) {


        const users = await this.db.getAllUsers(vip, filter);

        users.forEach(user => {
            this.bot.telegram.sendMessage(user.user_id, message);
        })


    }

    registerCallbacks() {

        this.bot.start(async (ctx) => {
            if (!(await this.db.userExists(ctx.message.from.id))) {
                ctx.reply(OKUDUM_ANLADIM, {reply_markup: KEYBOARDS.ZERO});
            }
            else ctx.reply("Seçiminizi yapınız...", { reply_markup: KEYBOARDS.INITIAL });
        });

        this.bot.hears('Welcome', (ctx) => {

            ctx.reply('Welcome.');
        })

        this.bot.hears(OKUDUM_ANLADIM, (ctx)=>{
            if (!(this.db.userExists(ctx.message.from.id))) this.db.createUser(ctx.message.from);
            ctx.reply("Seçiminizi yapınız...", { reply_markup: KEYBOARDS.INITIAL });
        })

        this.bot.use(async (ctx, next) => {
            const user_id = ctx.from.id;
            const chat_type: string = ctx.chat.type;

            if (!(await this.db.userExists(ctx.message.from.id))) {
                ctx.reply("Lütfen kullanıma başlamak icin okudum, anladıma basınız.", { reply_markup: KEYBOARDS.INITIAL });
                return;
            }


            if (waitlist.find(user_id)) {
                ctx.reply('⏰⏰ Lütfen 10 saniye bekleyin...');
                return;
            }


            if (chat_type !== 'private') {
                ctx.reply('Botu kullanabilmek için bota özel mesaj atınız.', { reply_markup: KEYBOARDS.INITIAL });
                return;
            }

            ctx.vip = (await this.db.isVIP(user_id)).vip;

            if (!ctx.vip) {
                ctx.reply('Botu kullanabilmek için üye olunuz.', { reply_markup: KEYBOARDS.INITIAL });
                return;
            }


            await next();
        })


        this.bot.hears(BUTTON_LIST.INITIAL, async (ctx) => {

            const message = ctx.message.text;
            const chat_id = ctx.chat.id;
            let reply_arr: string[];

            switch (message) {
                case BUTTON_LIST.INITIAL[0]:

                    reply_arr = await this.notifier.prepareWaitingOrders();
                    reply_arr.push('Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.');

                    for (let reply of reply_arr) {
                        await ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    };
                    break;
                case BUTTON_LIST.INITIAL[1]:

                    reply_arr = await this.notifier.prepareActiveOrders();
                    reply_arr.push('Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.');

                    for (let reply of reply_arr) {
                        await ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    };
                    break;
                case BUTTON_LIST.INITIAL[2]:
                    reply_arr = await this.notifier.preparePastOrders();
                    //reply_arr.push('Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.');
                    for (let reply of reply_arr) {
                        await ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    };
                    break;
                case BUTTON_LIST.INITIAL[3]:
                    ctx.reply(HELP_TEXT, { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case BUTTON_LIST.INITIAL[4]:
                    ctx.reply("Eğitim konusunu seçiniz.", { reply_markup: KEYBOARDS.LESSON });
                    break;
                case BUTTON_LIST.INITIAL[5]:
                    ctx.reply("Ne vereyim abime?", { reply_markup: KEYBOARDS.DATA });
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }
        });

        this.bot.hears(BUTTON_LIST.LESSON, async (ctx) => {
            const message = ctx.message.text;
            const chat_id = ctx.chat.id;
            switch (message) {
                case BUTTON_LIST.LESSON[0]:
                    ctx.reply(trade_egitimi, { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case BUTTON_LIST.LESSON[1]:
                    ctx.reply(vadeli_egitimi, { reply_markup: KEYBOARDS.INITIAL });
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }
        });


        this.bot.hears(BUTTON_LIST.DATA, async (ctx) => {

            const message = ctx.message.text;
            const chat_id = ctx.chat.id;

            switch (message) {
                //case BUTTON_LIST.DATA[0]://Indikatorler
                //    Queries.newQuery(chat_id, PROC_CONTEXT.INDICATOR);
                //    ctx.reply("İndikatör seçiniz.", { reply_markup: KEYBOARDS.INDICATOR });
                //    break;
                case BUTTON_LIST.DATA[0]://Long-Short
                    Queries.newQuery(chat_id, PROC_CONTEXT.LONGSHORT);
                    ctx.reply("Borsa türünü seçiniz.", { reply_markup: KEYBOARDS.STOCK });
                    break;
                case BUTTON_LIST.DATA[1]://Gunluk Long-Short
                    Queries.newQuery(chat_id, PROC_CONTEXT.CURRENTLS);
                    ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                    break;
                case BUTTON_LIST.DATA[2]://Likidite (Toplam)
                    Queries.newQuery(chat_id, PROC_CONTEXT.TOTALLIQUIDATION);
                    ctx.reply("symb yazip sembol seciniz. ör: btc", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                // case BUTTON_LIST.DATA[4]://Likidite (BitCoin Ozel)
                //     Queries.newQuery(chat_id, PROC_CONTEXT.BINANCELIQUIDATION);
                //     let LBOreply = await getBtcLiq();
                //     ctx.reply(LBOreply, { reply_markup: KEYBOARDS.INITIAL })
                //     break;
                // case BUTTON_LIST.DATA[5]://Likidite (Bitmex Ozel)
                //     Queries.newQuery(chat_id, PROC_CONTEXT.BITMEXLIQUIDATION);
                //     ctx.reply("mp yazip coin paritesi seciniz:", { reply_markup: KEYBOARDS.INITIAL });
                //     break;
                case BUTTON_LIST.DATA[3]://Trend Sorgu
                    Queries.newQuery(chat_id, PROC_CONTEXT.TRENDINDICATOR);
                    let TSreply = await getTrendInd();
                    ctx.reply(TSreply, { reply_markup: KEYBOARDS.INITIAL })
                    waitlist.push(chat_id);
                    break;
                // case BUTTON_LIST.DATA[7]://Hizli Hareket
                //     Queries.newQuery(chat_id, PROC_CONTEXT.RAPIDMOVEMENT);
                //     ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                //     break;
                case BUTTON_LIST.DATA[4]://Hacim Akisi
                    Queries.newQuery(chat_id, PROC_CONTEXT.VOLUMEFLOW);
                    ctx.reply("para akisi yazıp istediğiniz coinleri yazınız. ör: para akisi chz usdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                // case BUTTON_LIST.DATA[9]://Balina Ticareti
                //     Queries.newQuery(chat_id, PROC_CONTEXT.XTRADE);
                //     ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                //     break;
                // case BUTTON_LIST.DATA[10]://Canli Ticaret
                //     Queries.newQuery(chat_id, PROC_CONTEXT.LIVETRADE);
                //     ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                //     break;
                case BUTTON_LIST.DATA[5]://24 Saatlik Hacim islemi
                    Queries.newQuery(chat_id, PROC_CONTEXT.HOURLY24VF);
                    ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                    break;
                // case BUTTON_LIST.DATA[12]://OHLCV
                //     Queries.newQuery(chat_id, PROC_CONTEXT.OHLCV);
                //     ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                //     break;
                // case BUTTON_LIST.DATA[13]://Gunluk Volume
                //     Queries.newQuery(chat_id, PROC_CONTEXT.DAILYVOL);
                //     ctx.reply("symb yazip sembol seciniz:", { reply_markup: KEYBOARDS.INITIAL });
                //     break;
                // case BUTTON_LIST.DATA[14]://Saatlik Volume
                //     Queries.newQuery(chat_id, PROC_CONTEXT.HOURLYVOL);
                //     ctx.reply("symb yazip sembol seciniz:", { reply_markup: KEYBOARDS.INITIAL });
                //     break;
                // case BUTTON_LIST.DATA[15]://Birlestirilmis Volume
                //     Queries.newQuery(chat_id, PROC_CONTEXT.MERGEDVOL);
                //     ctx.reply("Exchange tipini seciniz:", { reply_markup: KEYBOARDS.EXCHANGE });
                //     break;
                case BUTTON_LIST.DATA[6]://TickerList
                    Queries.newQuery(chat_id, PROC_CONTEXT.TICKERLIST);
                    ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                    break;
                // case BUTTON_LIST.DATA[17]://Acik Kar
                //     Queries.newQuery(chat_id, PROC_CONTEXT.TICKERLIST);
                //     ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                //     break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }


        });

        this.bot.hears(BUTTON_LIST.INDICATOR, async (ctx) => {
            const message = ctx.message.text;
            const chat_id = ctx.message.chat.id;
            const context = PROC_CONTEXT.INDICATOR;
            Queries.addDataSafe(chat_id, context, message);
            ctx.reply("Borsa türünü seçiniz.", { reply_markup: KEYBOARDS.STOCK });
        });

        this.bot.hears(BUTTON_LIST.STOCK, async (ctx) => {
            const message = ctx.message.text;
            const chat_id = ctx.message.chat.id;
            let query = Queries.getQuery(chat_id);
            Queries.addData(chat_id, message);
            switch (query.context) {
                case PROC_CONTEXT.LONGSHORT:
                    ctx.reply("pa yazip parite seciniz. ör: btcusdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.RAPIDMOVEMENT:
                    ctx.reply("pa yazip parite seciniz. ör: btcusdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.OPENINTEREST:
                    ctx.reply("mp yazip coin paritesi seciniz. ör: btc-usdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.CURRENTLS:
                    ctx.reply("symb yazip sembol seciniz. ör: btc", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.TICKERLIST:
                    ctx.reply("mp yazip parite seciniz. ör: btc-usdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.XTRADE:
                    ctx.reply("symb yazip sembol seciniz. ör: btc", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.LIVETRADE:
                    ctx.reply("pa yazip parite seciniz. ör: btcusdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.OHLCV:
                    ctx.reply("Zaman araligi seçiniz:", { reply_markup: KEYBOARDS.TIMEFRAME });
                    break;
                case PROC_CONTEXT.HOURLY24VF:
                    ctx.reply("pa yazip parite seciniz. ör: btcusdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.INDICATOR:
                    ctx.reply("Kaynak seciniz:", { reply_markup: KEYBOARDS.SOURCE });
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }
        })

        this.bot.hears(BUTTON_LIST.EXCHANGE, async (ctx) => {

            const message = ctx.message.text;
            const chat_id = ctx.message.chat.id;
            const context = PROC_CONTEXT.MERGEDVOL;
            switch (message) {
                case BUTTON_LIST.EXCHANGE[0]://Spot
                    Queries.addDataSafe(chat_id, context, "spot");
                    break;

                case BUTTON_LIST.EXCHANGE[1]://Vadeli
                    Queries.addDataSafe(chat_id, context, "futures");
                    break;

                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }
            ctx.reply("Zaman araligi seciniz:", { reply_markup: KEYBOARDS.TIMEFRAME });
        })

        this.bot.hears(BUTTON_LIST.SOURCE, async (ctx) => {

            const message = ctx.message.text;
            const chat_id = ctx.message.chat.id;
            const context = PROC_CONTEXT.INDICATOR;
            switch (message) {
                case BUTTON_LIST.SOURCE[0]: //Acilis
                    Queries.addDataSafe(chat_id, context, "open");
                    break;
                case BUTTON_LIST.SOURCE[1]://kapanis
                    Queries.addDataSafe(chat_id, context, "close");
                    break;
                case BUTTON_LIST.SOURCE[2]: //en yuksek
                    Queries.addDataSafe(chat_id, context, "high");
                    break;
                case BUTTON_LIST.SOURCE[3]://en dusuk
                    Queries.addDataSafe(chat_id, context, "low");
                    break;
                case BUTTON_LIST.SOURCE[5]: //volume
                    Queries.addDataSafe(chat_id, context, "volume");
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }
            ctx.reply("Period yaziniz", { reply_markup: KEYBOARDS.DATA });
        })




        this.bot.hears(BUTTON_LIST.TIMEFRAME, async (ctx) => {
            const message = ctx.message.text;
            const chat_id = ctx.message.chat.id;
            let query = Queries.getQuery(chat_id);
            let timeframe = ''
            switch (message) {
                case BUTTON_LIST.TIMEFRAME[0]:
                    timeframe = '5m';
                    break;
                case BUTTON_LIST.TIMEFRAME[1]:
                    timeframe = '15m';
                    break;
                case BUTTON_LIST.TIMEFRAME[2]:
                    timeframe = '30m';
                    break;
                case BUTTON_LIST.TIMEFRAME[3]:
                    timeframe = '1h';
                    break;
                case BUTTON_LIST.TIMEFRAME[4]:
                    timeframe = '4h';
                    break;
                case BUTTON_LIST.TIMEFRAME[5]:
                    timeframe = 'd';
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }
            Queries.addData(chat_id, timeframe);
            switch (query.context) {
                case PROC_CONTEXT.OHLCV:
                    ctx.reply("pa yazip parite seçiniz. ör: btcusdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.INDICATOR:
                    ctx.reply("mp yazip coin seciniz. ör: btc-usdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case PROC_CONTEXT.MERGEDVOL:
                    ctx.reply("symb yazip coin seciniz. ör: btc", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }
        })

        this.bot.hears(/^[0-9]{1,3}/, async (ctx) => {
            const message = ctx.message.text;
            const chat_id = ctx.message.chat.id;
            let query = Queries.getQuery(chat_id);
            if (query.context == PROC_CONTEXT.INDICATOR) {
                Queries.addDataSafe(chat_id, PROC_CONTEXT.INDICATOR, message);
                ctx.reply("Zaman araligi seciniz.", { reply_markup: KEYBOARDS.TIMEFRAME })
            }
            else {
                ctx.reply("Lutfen islem seciniz", { reply_markup: KEYBOARDS.INITIAL });
            }
        });

        this.bot.hears(/(?<=symb ).*/i, async (ctx) => {
            const message = ctx.message.text;
            const coin = message.replace('symb ', '');
            const chat_id = ctx.message.chat.id;
            let query = Queries.getQuery(chat_id);
            let reply = "";

            switch (query.context) {
                case PROC_CONTEXT.CURRENTLS:
                    reply = await getCurrentLS([query.data[0], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.MERGEDVOL:
                    reply = await getMergedVolume([query.data[0], query.data[1], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.XTRADE:
                    reply = await getXTrade([query.data[0], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.TOTALLIQUIDATION:
                    reply = await getTotalLiq([coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.HOURLYVOL:
                    reply = await getHourlyVolume([coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.DAILYVOL:
                    reply = await getDailyVolume([coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                default:
                    Queries.removeQuery(chat_id);
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
            }

            waitlist.push(chat_id);

        })

        this.bot.hears(/(?<=pa ).*/i, async (ctx) => {
            const message = ctx.message.text;
            const coin = message.replace('pa ', '');
            const chat_id = ctx.message.chat.id;
            let query = Queries.getQuery(chat_id);
            let reply = "";

            switch (query.context) {
                case PROC_CONTEXT.LIVETRADE:
                    reply = await getLiveTrade([query.data[0], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.OHLCV:
                    reply = await getOhlcv([query.data[0], query.data[1], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.LONGSHORT:
                    reply = await getLongShort([query.data[0], query.data[1], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.RAPIDMOVEMENT:
                    reply = await getRapidMov([query.data[0], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.HOURLY24VF:
                    reply = await getTradeVol24h([query.data[0], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
            }

            waitlist.push(chat_id);

        })

        this.bot.hears(/(?<=mp ).*/i, async (ctx) => {
            const message = ctx.message.text;
            const coin = message.replace('mp ', '');
            const chat_id = ctx.message.chat.id;
            let query = Queries.getQuery(chat_id);
            Queries.addData(chat_id, coin);
            let reply = "";

            switch (query.context) {
                case PROC_CONTEXT.INDICATOR:
                    reply = await getIndicator(query.data);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.BITMEXLIQUIDATION:
                    reply = await getBitmexLiq(query.data);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.OPENINTEREST:
                    reply = await getOpenInterest(query.data);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                case PROC_CONTEXT.TICKERLIST:
                    reply = await getTickerList(query.data);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    break;

            }

            waitlist.push(chat_id);

        })

        this.bot.hears(/(?<=para akisi ).*/i, async (ctx) => {
            const message = ctx.message.text;
            const coins = message.split(' ');//split yapicammmmmm
            const chat_id = ctx.message.chat.id;
            let query = Queries.getQuery(chat_id);
            if (query.context == PROC_CONTEXT.VOLUMEFLOW) {
                Queries.addDataSafe(chat_id, query.context, coins[2]);
                Queries.addDataSafe(chat_id, query.context, coins[3]);
                let reply = await getVolFlow(query.data);
                ctx.reply(reply, { reply_markup: KEYBOARDS.DATA });
            }
            else ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });


            Queries.removeQuery(chat_id);
            waitlist.push(chat_id);

        })

        this.bot.hears(/.*/, async (ctx) => {
            Queries.removeQuery(ctx.chat.id);
            ctx.reply("Everything is fine.", { reply_markup: KEYBOARDS.INITIAL })
        })


    }




    async start() {
        await this.bot.launch();
        logger.tele_bot('Telegram Bot started');
    }


    stop() {
        this.bot.stop();
        logger.tele_bot('Telegram Bot stopped');
    }

}





export default TelegramBot;

