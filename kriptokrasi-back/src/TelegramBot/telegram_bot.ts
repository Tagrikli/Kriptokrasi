import { Context, Telegraf } from "telegraf";
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
import QUERIES from "../Database/queries";


class TelegramBot {
    bot: Telegraf<TContext>
    db: DatabaseManager;
    notifier: Notifier;

    constructor(token: string, db: DatabaseManager, notifier: Notifier) {
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

            try {
                this.bot.telegram.sendMessage(user.user_id, message);
            } catch (error) {
                logger.error(error);
            }
        })
    }

    registerCallbacks() {

        this.bot.start(async (ctx) => {
            try{
                if (!(await this.db.userExists(ctx.message.from.id))) {
                    ctx.reply(OKUDUM_ANLADIM, { reply_markup: KEYBOARDS.ZERO });
                }
                else ctx.reply("Seçiminizi yapınız...", { reply_markup: KEYBOARDS.INITIAL });
            }catch(error){
                logger.error(error);
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        });


        this.bot.hears('Welcome', (ctx) => {
            ctx.reply('Welcome.');
        })

        this.bot.hears(BUTTON_LIST.ZERO, async (ctx) => {
            try{
                if (!(await this.db.userExists(ctx.message.from.id))) this.db.createUser(ctx.message.from);
                ctx.reply("Seçiminizi yapınız...", { reply_markup: KEYBOARDS.INITIAL });
            }catch(error){
                logger.error(error);
                console.log('something went wrong in okudum anladim');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }                
        })
        //buraya satin al butonu koyulcak
        // this.bot.hears(BUTTON_LIST.INITIAL[6],async (ctx) => {
        //     ctx.reply("Satın Al Botu", {reply_markup: KEYBOARDS.INITIAL})
        // })

        this.bot.use(async (ctx, next) => {
            try{
                const user_id = ctx.from.id;
                const chat_type: string = ctx.chat.type;

                if (waitlist.find(user_id)) {
                    ctx.reply('⏰⏰ Lütfen 10 saniye bekleyin...');
                    return;
                }

                if (!(await this.db.userExists(ctx.message.from.id))) {
                    ctx.reply("Lütfen kullanıma başlamak icin okudum, anladıma basınız.", { reply_markup: KEYBOARDS.ZERO });
                    ctx.reply(OKUDUM_ANLADIM, { reply_markup: KEYBOARDS.ZERO });
                    waitlist.push(user_id);
                    return;
                }


                if (chat_type !== 'private') {
                    ctx.reply('Botu kullanabilmek için bota özel mesaj atınız.', { reply_markup: KEYBOARDS.INITIAL });
                    return;
                }

                let isVip = await this.db.isVIP(user_id);
                ctx.vip = isVip.vip && isVip.timeout ;

                if ((!ctx.vip) && (!await this.db.isVillagerDay())) {
                    ctx.reply('Botu kullanabilmek için üye olunuz.', { reply_markup: KEYBOARDS.INITIAL });
                    return;
                }

                await next();
            }catch(error){
                logger.error(error);
                console.log('something went wrong in vip check');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })


        this.bot.hears(BUTTON_LIST.INITIAL, async (ctx) => {
            try{
                const message = ctx.message.text;
                const chat_id = ctx.chat.id;
                let reply_arr: string[];

                switch (message) {
                    case BUTTON_LIST.INITIAL[0]:

                        reply_arr = await this.notifier.prepareWaitingOrders();
                        reply_arr.push('Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.');

                        for (let reply of reply_arr) {
                            await ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                        };
                        break;
                    case BUTTON_LIST.INITIAL[1]:

                        reply_arr = await this.notifier.prepareActiveOrders();
                        reply_arr.push('Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.');

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
                    case BUTTON_LIST.INITIAL[4]: //egitime basınca
                        ctx.reply("Eğitim konusunu seçiniz.", { reply_markup: KEYBOARDS.LESSON });
                        break;
                    case BUTTON_LIST.INITIAL[5]: //anlık dataya basınca
                        ctx.reply("Data seçiniz.", { reply_markup: KEYBOARDS.DATA });
                        break;
                    default:
                        ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                }
            }catch(error){
                logger.error(error);
                console.log('something went wrong in initial keyboard');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        });

        this.bot.hears(BUTTON_LIST.LESSON, async (ctx) => {
            try{
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
            }catch(error){
                logger.error(error);
                console.log('something went wrong0');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        });


        this.bot.hears(BUTTON_LIST.DATA, async (ctx) => {

            const message = ctx.message.text;
            const chat_id = ctx.chat.id;
            try{
                switch (message) {
                //case BUTTON_LIST.DATA[0]://Indikatorler
                //    Queries.newQuery(chat_id, PROC_CONTEXT.INDICATOR);
                //    ctx.reply("İndikatör seçiniz.", { reply_markup: KEYBOARDS.INDICATOR });
                //    break;
                case BUTTON_LIST.DATA[0]://Long-Short
                    Queries.newQuery(chat_id, PROC_CONTEXT.LONGSHORT);
                    console.log('Longshorta basildi', ctx.from.id);
                    ctx.reply("ls yazıp parite giriniz. ör: ls btc-usdt.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case BUTTON_LIST.DATA[1]://Gunluk Long-Short
                    Queries.newQuery(chat_id, PROC_CONTEXT.CURRENTLS);
                    console.log('gunluk longshorta basildi', ctx.from.id)
                    ctx.reply("gls yazıp coin ismi giriniz. ör: gls btc", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                case BUTTON_LIST.DATA[2]://Likidite (Toplam)
                    Queries.newQuery(chat_id, PROC_CONTEXT.TOTALLIQUIDATION);
                    console.log('likidite toplama basildi', ctx.from.id)
                    ctx.reply("symb yazip sembol seciniz. ör: symb btc", { reply_markup: KEYBOARDS.INITIAL });
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
                    console.log('trend sorguya basildi', ctx.from.id);
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
                    console.log('hacim akisina basildi', ctx.from.id);
                    ctx.reply("para yazıp istediğiniz coinleri yazınız. ör: para chz usdt", { reply_markup: KEYBOARDS.INITIAL });
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
                    console.log('24 saatlik hacim islemine basildi', ctx.from.id);
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
                case BUTTON_LIST.DATA[6]://TickerList (coinGBT)
                    Queries.newQuery(chat_id, PROC_CONTEXT.TICKERLIST);
                    console.log('coingbtye basildi', ctx.from.id)
                    ctx.reply("mp yazip parite seçiniz. ör: mp btcusdt", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                // case BUTTON_LIST.DATA[17]://Acik Kar
                //     Queries.newQuery(chat_id, PROC_CONTEXT.OPENINTEREST);
                //     ctx.reply("Borsa türünü seçiniz:", { reply_markup: KEYBOARDS.STOCK });
                //     break;
                default:
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    break;
                }
            }catch(error){
                logger.error(error);
                console.log('something went wrong1');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        });

        this.bot.hears(BUTTON_LIST.INDICATOR, async (ctx) => {
            try
            {
                const message = ctx.message.text;
                const chat_id = ctx.message.chat.id;
                const context = PROC_CONTEXT.INDICATOR;
                Queries.addDataSafe(chat_id, context, message);
                ctx.reply("Borsa türünü seçiniz.", { reply_markup: KEYBOARDS.STOCK });
            }catch(error){
                logger.error(error);
                console.log('something went wrong2');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        });

        this.bot.hears(BUTTON_LIST.STOCK, async (ctx) => {
            try{    
                const message = ctx.message.text;
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
                Queries.addData(chat_id, message);
                switch (query.context) {
                    case PROC_CONTEXT.LONGSHORT:
                        ctx.reply("pa yazip parite seçiniz. ör: pa btc-usdt", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                    case PROC_CONTEXT.RAPIDMOVEMENT:
                        ctx.reply("pa yazip parite seçiniz. ör: pa btc-usdt", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                    case PROC_CONTEXT.OPENINTEREST:
                        ctx.reply("mp yazip coin paritesi seçiniz. ör: mp btcusdt", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                    case PROC_CONTEXT.CURRENTLS:
                        ctx.reply("symb yazip sembol seciniz. ör: symb btc", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                    case PROC_CONTEXT.XTRADE:
                        ctx.reply("symb yazip sembol seçiniz. ör: symb btc", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                    case PROC_CONTEXT.LIVETRADE:
                        ctx.reply("pa yazip parite seçiniz. ör: pa btc-usdt", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                    case PROC_CONTEXT.OHLCV:
                        ctx.reply("Zaman aralığı seçiniz.", { reply_markup: KEYBOARDS.TIMEFRAME });
                        break;
                    case PROC_CONTEXT.HOURLY24VF:
                        ctx.reply("24saat yazıp parite seçiniz. ör: 24saat btc-usdt", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                    case PROC_CONTEXT.INDICATOR:
                        ctx.reply("Kaynak seçiniz:", { reply_markup: KEYBOARDS.SOURCE });
                        break;
                    default:
                        ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                }
            }catch(error){
                logger.error(error);
                console.log('something went wrong3');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })

        this.bot.hears(BUTTON_LIST.EXCHANGE, async (ctx) => {
            try{    
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
            }catch(error){
                logger.error(error);
                console.log('something went wrong4');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })

        this.bot.hears(BUTTON_LIST.SOURCE, async (ctx) => {
            try{    
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
            }catch(error){
                logger.error(error);
                console.log('something went wrong5');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })


        this.bot.hears(BUTTON_LIST.TIMEFRAME, async (ctx) => {
            try{    
                const message = ctx.message.text;
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
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
            }catch(error){
                logger.error(error);
                console.log('something went wrong6');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })

        this.bot.hears(/(?<=24saat ).*/i, async (ctx) => {
            try{    
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
                if (query.context == PROC_CONTEXT.HOURLY24VF) {
                    let reply = await getTradeVol24h([query.data[0], coin]);
                    ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                }
                else ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });

                Queries.removeQuery(chat_id);
                waitlist.push(chat_id);
            }catch(error){
                logger.error(error);
                console.log('something went wrong7');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })


        this.bot.hears(/^[0-9]{1,3}/, async (ctx) => {
            try{    
                const message = ctx.message.text;
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
                if (query.context == PROC_CONTEXT.INDICATOR) {
                    Queries.addDataSafe(chat_id, PROC_CONTEXT.INDICATOR, message);
                    ctx.reply("Zaman araligi seciniz.", { reply_markup: KEYBOARDS.TIMEFRAME })
                }
                else {
                    ctx.reply("Lutfen islem seciniz", { reply_markup: KEYBOARDS.INITIAL });
                }
            }catch(error){
                logger.error(error);
                console.log('something went wrong8');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        });

        this.bot.hears(/(?<=symb ).*/i, async (ctx) => {
            try{
                const message = ctx.message.text;
                const coin = message.split(' ');
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
                let reply = "";

                switch (query.context) {
                    case PROC_CONTEXT.MERGEDVOL:
                        reply = await getMergedVolume([query.data[0], query.data[1], coin[1]]);
                        ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                    case PROC_CONTEXT.XTRADE:
                        reply = await getXTrade([query.data[0], coin[1]]);
                        ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                    case PROC_CONTEXT.TOTALLIQUIDATION:
                        reply = await getTotalLiq([coin[1]]);
                        ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                    case PROC_CONTEXT.HOURLYVOL:
                        reply = await getHourlyVolume([coin[1]]);
                        ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                    case PROC_CONTEXT.DAILYVOL:
                        reply = await getDailyVolume([coin[1]]);
                        ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                    default:
                        Queries.removeQuery(chat_id);
                        ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                        break;
                }
                waitlist.push(chat_id);
            }catch(error){
                logger.error(error);
                console.log('something went wrong6');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }

        })

        this.bot.hears(/(?<=pa ).*/i, async (ctx) => {
            try{    
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
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
                    case PROC_CONTEXT.RAPIDMOVEMENT:
                        reply = await getRapidMov([query.data[0], coin]);
                        ctx.reply(reply, { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                    default:
                        ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                }

                waitlist.push(chat_id);
            }catch(error){
                logger.error(error);
                console.log('something went wrong9');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }

        })

        this.bot.hears(/(?<=mp ).*/i, async (ctx) => {
            try{    
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
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
            }catch(error){
                logger.error(error);
                console.log('something went wrong10');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }

        })

        this.bot.hears(/(?<=gls ).*/i, async (ctx) => {
            try{
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
                if (query.context == PROC_CONTEXT.CURRENTLS) {
                    let reply = await getCurrentLS([coin]);
                    let msg = reply[0] as string;
                    let status = reply[1] as number;
                    ctx.reply(msg, { reply_markup: KEYBOARDS.INITIAL });
                    if (status == 200) {
                        Queries.removeQuery(chat_id);
                        waitlist.push(chat_id);
                    }
                }
                else {
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    waitlist.push(chat_id);
                }
            }catch(error){
                logger.error(error);
                console.log('something went wrong11');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })

        this.bot.hears(/(?<=ls ).*/i, async (ctx) => {
            try{
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
                console.log("longshort secildi", query);
                switch (query.context) {
                    case PROC_CONTEXT.LONGSHORT:
                        let reply = await getLongShort([coin]);
                        let msg = reply[0] as string;
                        let status = reply[1] as number;
                        ctx.reply(msg, { reply_markup: KEYBOARDS.INITIAL });
                        if (status == 200) {
                            Queries.removeQuery(chat_id);
                            waitlist.push(chat_id);
                        }
                        break;
                    default:
                        ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                        Queries.removeQuery(chat_id);
                        break;
                }
            }catch(error){
                logger.error(error);
                console.log('something went wrong12');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })


        this.bot.hears(/(?<=para ).*/i, async (ctx) => {
            try{
                const message = ctx.message.text;
                const coins = message.split(' ');
                const chat_id = ctx.message.chat.id;
                let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL }); return; }
                if (query.context == PROC_CONTEXT.VOLUMEFLOW) {
                    Queries.addDataSafe(chat_id, query.context, coins[1]);
                    Queries.addDataSafe(chat_id, query.context, coins[2]);
                    let reply = await getVolFlow(query.data);
                    let msg = reply[0] as string;
                    let status = reply[1] as number;
                    ctx.reply(msg, { reply_markup: KEYBOARDS.INITIAL });
                    if (status == 200) {
                        Queries.removeQuery(chat_id);
                        waitlist.push(chat_id);
                    }
                }
                else {
                    ctx.reply("Lütfen önce işlem seçiniz.", { reply_markup: KEYBOARDS.INITIAL });
                    Queries.removeQuery(chat_id);
                    waitlist.push(chat_id);
                }
            }catch(error){
                logger.error(error);
                console.log('something went wrong13');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
        })

        this.bot.hears(/.*/, async (ctx) => {
            try{
            Queries.removeQuery(ctx.chat.id);
            ctx.reply("Everything is fine.", { reply_markup: KEYBOARDS.INITIAL })
            }catch(error){
                logger.error(error);
                console.log('naaptin kral');
                ctx.reply("Bir şeyler yanlış gitti. Yeniden deneyin.", {reply_markup: KEYBOARDS.INITIAL});
            }
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

