"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const bot_functions_1 = require("./bot_functions");
const consts_1 = require("../keyboards/consts");
const keyboards_1 = require("../keyboards/keyboards");
const Query_1 = require("../Query");
const types_1 = require("../utils/types");
const Waitlist_1 = require("../Waitlist");
const logger_1 = __importDefault(require("../Logger/logger"));
const message_data_1 = __importDefault(require("../Messages/message_data"));
class TelegramBot {
    bot;
    db;
    notifier;
    constructor(token, db, notifier) {
        this.bot = new telegraf_1.Telegraf(token);
        this.db = db;
        this.notifier = notifier;
        this.registerCallbacks();
    }
    async webhookCallback(message) {
        try {
            const users = await this.db.getAllUsers(true, true);
            users.forEach(async (user) => this.bot.telegram.sendMessage(user.user_id, message));
        }
        catch (reason) {
            logger_1.default.error(reason);
        }
    }
    async sendMessageToAll(vip, filter, message, language) {
        const users = await this.db.getAllUsers(vip, filter);
        console.log('helllo', message, language);
        users.forEach(user => {
            if (user.language === language) {
                try {
                    this.bot.telegram.sendMessage(user.user_id, message);
                }
                catch (error) {
                    logger_1.default.error(error);
                }
            }
        });
    }
    registerCallbacks() {
        this.bot.start(async (ctx) => {
            try {
                if (!(await this.db.userExists(ctx.message.from.id))) {
                    await this.db.createUser(ctx.message.from);
                    ctx.reply(message_data_1.default.SELECT_LANGUAGE, { reply_markup: keyboards_1.KEYBOARDS.LANGUAGE });
                }
                else {
                    let lang = await this.db.getUserLangPrefbyID(ctx.message.from.id);
                    if (lang == 'TR') {
                        ctx.reply(consts_1.OKUDUM_ANLADIM, { reply_markup: keyboards_1.KEYBOARDS.ZEROTR
                        });
                    }
                    else {
                        ctx.reply(consts_1.READ_UNDERSTOOD, { reply_markup: keyboards_1.KEYBOARDS.ZEROEN });
                    }
                }
            }
            catch (error) {
                ctx.reply(`
                ${message_data_1.default.UNKNOWN_ERROR.tr}
                ${message_data_1.default.UNKNOWN_ERROR.en}
                `, {
                    reply_markup: keyboards_1.KEYBOARDS.LANGUAGE
                });
            }
        });
        this.bot.hears('Welcome', (ctx) => {
            ctx.reply('Welcome.');
        });
        this.bot.hears(consts_1.BUTTON_LIST.LANGUAGE, async (ctx) => {
            const user_id = ctx.message.from.id;
            const message = ctx.message.text;
            try {
                if (message === consts_1.BUTTON_LIST.LANGUAGE[0]) {
                    await this.db.updateLang(user_id, "TR");
                    ctx.reply(consts_1.OKUDUM_ANLADIM, { reply_markup: keyboards_1.KEYBOARDS.ZEROTR });
                }
                else {
                    await this.db.updateLang(user_id, "EN");
                    ctx.reply(consts_1.READ_UNDERSTOOD, { reply_markup: keyboards_1.KEYBOARDS.ZEROEN });
                }
            }
            catch (error) {
                logger_1.default.error(error);
                ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
            }
        });
        this.bot.hears(consts_1.BUTTON_LIST.ZEROTR, async (ctx) => {
            try {
                ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong in okudum anladim');
                ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
            }
        });
        this.bot.hears(consts_1.BUTTON_LIST.ZEROEN, async (ctx) => {
            try {
                ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong in okudum anladim in english');
                ctx.reply("Choose an action.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        //buraya satin al butonu koyulcak
        // this.bot.hears(BUTTON_LIST.INITIAL_TR[6],async (ctx) => {
        //     ctx.reply("Sat??n Al Botu", {reply_markup: KEYBOARDS.INITIAL_TR})
        // })
        this.bot.use(async (ctx, next) => {
            try {
                const user_id = ctx.from.id;
                const chat_type = ctx.chat.type;
                const lang = await this.db.getUserLangPrefbyID(user_id);
                if (Waitlist_1.waitlist.find(user_id)) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.WAIT_10_SECS.tr);
                    else
                        ctx.reply(message_data_1.default.WAIT_10_SECS.en);
                    return;
                }
                if (!(await this.db.userExists(ctx.message.from.id))) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.START_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.ZEROTR });
                    else
                        ctx.reply(message_data_1.default.START_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.ZEROEN });
                    Waitlist_1.waitlist.push(user_id);
                    return;
                }
                if (chat_type !== 'private') {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.REQUEST_PRIVATE.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.REQUEST_PRIVATE.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                let isVip = await this.db.isVIP(user_id);
                ctx.vip = isVip.vip && isVip.timeout;
                if ((!ctx.vip) && (!await this.db.isVillagerDay())) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.GET_MEMBERSHIP.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.GET_MEMBERSHIP.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                await next();
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong in vip check');
                ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.LANGUAGE });
                ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.LANGUAGE });
            }
        });
        this.bot.hears(consts_1.BUTTON_LIST.INITIAL_TR, async (ctx) => {
            try {
                const message = ctx.message.text;
                const user_id = ctx.from.id;
                let reply_arr;
                switch (message) {
                    case consts_1.BUTTON_LIST.INITIAL_TR[0]:
                        reply_arr = await this.notifier.prepareWaitingOrdersTR();
                        reply_arr.push(message_data_1.default.NOT_ADVISE.tr);
                        for (let reply of reply_arr) {
                            await ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        }
                        ;
                        break;
                    case consts_1.BUTTON_LIST.INITIAL_TR[1]:
                        reply_arr = await this.notifier.prepareActiveOrdersTR();
                        reply_arr.push(message_data_1.default.NOT_ADVISE.tr);
                        for (let reply of reply_arr) {
                            await ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        }
                        ;
                        break;
                    case consts_1.BUTTON_LIST.INITIAL_TR[2]:
                        reply_arr = await this.notifier.preparePastOrdersTR();
                        //reply_arr.push('Bireysel i??lemlerdir. Yat??r??m Tavsiyesi De??ildir. Stopsuz i??lem yapmay??n??z.');
                        for (let reply of reply_arr) {
                            await ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        }
                        ;
                        break;
                    case consts_1.BUTTON_LIST.INITIAL_TR[3]:
                        await ctx.reply(consts_1.HELP_TEXT, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    // case BUTTON_LIST.INITIAL_TR[4]: //egitime bas??nca
                    //     ctx.reply("E??itim konusunu se??iniz.", { reply_markup: KEYBOARDS.LESSON });
                    //     break;
                    case consts_1.BUTTON_LIST.INITIAL_TR[4]: //anl??k dataya bas??nca
                        ctx.reply(message_data_1.default.CHOOSE_DATA.tr, { reply_markup: keyboards_1.KEYBOARDS.DATATR });
                        break;
                    default:
                        ctx.reply("L??tfen ??nce i??lem se??iniz.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong in initial keyboard');
                ctx.reply("Bir ??eyler yanl???? gitti. Yeniden deneyin.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
            }
        });
        this.bot.hears(consts_1.BUTTON_LIST.INITIAL_EN, async (ctx) => {
            try {
                const message = ctx.message.text;
                const user_id = ctx.from.id;
                let reply_arr;
                switch (message) {
                    case consts_1.BUTTON_LIST.INITIAL_EN[0]:
                        reply_arr = await this.notifier.prepareWaitingOrdersEN();
                        reply_arr.push(message_data_1.default.NOT_ADVISE.en);
                        for (let reply of reply_arr) {
                            await ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        }
                        ;
                        break;
                    case consts_1.BUTTON_LIST.INITIAL_EN[1]:
                        reply_arr = await this.notifier.prepareActiveOrdersEN();
                        reply_arr.push(message_data_1.default.NOT_ADVISE.en);
                        for (let reply of reply_arr) {
                            await ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        }
                        ;
                        break;
                    case consts_1.BUTTON_LIST.INITIAL_EN[2]:
                        reply_arr = await this.notifier.preparePastOrdersEN();
                        //reply_arr.push('Bireysel i??lemlerdir. Yat??r??m Tavsiyesi De??ildir. Stopsuz i??lem yapmay??n??z.');
                        for (let reply of reply_arr) {
                            await ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        }
                        ;
                        break;
                    case consts_1.BUTTON_LIST.INITIAL_EN[3]:
                        await ctx.reply(consts_1.HELP_TEXT_EN, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    // case BUTTON_LIST.INITIAL_TR[4]: //egitime bas??nca
                    //     ctx.reply("E??itim konusunu se??iniz.", { reply_markup: KEYBOARDS.LESSON });
                    //     break;
                    case consts_1.BUTTON_LIST.INITIAL_EN[4]: //anl??k dataya bas??nca
                        ctx.reply(message_data_1.default.CHOOSE_DATA.en, { reply_markup: keyboards_1.KEYBOARDS.DATAEN });
                        break;
                    default:
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong in initial keyboard');
                ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(consts_1.BUTTON_LIST.LESSON, async (ctx) => {
            try {
                const message = ctx.message.text;
                const user_id = ctx.from.id;
                const lang = await this.db.getUserLangPrefbyID(user_id);
                switch (message) {
                    case consts_1.BUTTON_LIST.LESSON[0]:
                        ctx.reply(consts_1.trade_egitimi, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    case consts_1.BUTTON_LIST.LESSON[1]:
                        ctx.reply(consts_1.vadeli_egitimi, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    default:
                        if (lang === 'TR')
                            ctx.reply("L??tfen ??nce i??lem se??iniz.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply('Please choose an action first.', { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong0');
                ctx.reply("Bir ??eyler yanl???? gitti. Yeniden deneyin.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
            }
        });
        this.bot.hears(consts_1.BUTTON_LIST.DATATR, async (ctx) => {
            const message = ctx.message.text;
            const chat_id = ctx.chat.id;
            const lang = await this.db.getUserLangPrefbyID(ctx.from.id);
            try {
                switch (message) {
                    //case BUTTON_LIST.DATA[0]://Indikatorler
                    //    Queries.newQuery(chat_id, PROC_CONTEXT.INDICATOR);
                    //    ctx.reply("??ndikat??r se??iniz.", { reply_markup: KEYBOARDS.INDICATOR });
                    //    break;
                    case consts_1.BUTTON_LIST.DATATR[0]: //Long-Short
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.LONGSHORT);
                        console.log('Longshorta basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_LS.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    case consts_1.BUTTON_LIST.DATATR[1]: //Gunluk Long-Short
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.CURRENTLS);
                        console.log('gunluk longshorta basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_GLS.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    case consts_1.BUTTON_LIST.DATATR[2]: //Likidite (Toplam)
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.TOTALLIQUIDATION);
                        console.log('likidite toplama basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_SYMB.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    // case BUTTON_LIST.DATA[4]://Likidite (BitCoin Ozel)
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.BINANCELIQUIDATION);
                    //     let LBOreply = await getBtcLiq();
                    //     ctx.reply(LBOreply, { reply_markup: KEYBOARDS.INITIAL_TR })
                    //     break;
                    // case BUTTON_LIST.DATA[5]://Likidite (Bitmex Ozel)
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.BITMEXLIQUIDATION);
                    //     ctx.reply("mp yazip coin paritesi seciniz:", { reply_markup: KEYBOARDS.INITIAL_TR });
                    //     break;
                    case consts_1.BUTTON_LIST.DATATR[3]: //Trend Sorgu
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.TRENDINDICATOR);
                        console.log('trend sorguya basildi', ctx.from.id);
                        let TSreply = await (0, bot_functions_1.getTrendInd)(lang);
                        ctx.reply(TSreply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Waitlist_1.waitlist.push(chat_id);
                        break;
                    // case BUTTON_LIST.DATA[7]://Hizli Hareket
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.RAPIDMOVEMENT);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    case consts_1.BUTTON_LIST.DATATR[4]: //Hacim Akisi
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.VOLUMEFLOW);
                        console.log('hacim akisina basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_PARA.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    // case BUTTON_LIST.DATA[9]://Balina Ticareti
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.XTRADE);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    // case BUTTON_LIST.DATA[10]://Canli Ticaret
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.LIVETRADE);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    case consts_1.BUTTON_LIST.DATATR[5]: //24 Saatlik Hacim islemi
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.HOURLY24VF);
                        console.log('24 saatlik hacim islemine basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.CHOOSE_STOCK.tr, { reply_markup: keyboards_1.KEYBOARDS.STOCK });
                        break;
                    // case BUTTON_LIST.DATA[12]://OHLCV
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.OHLCV);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    // case BUTTON_LIST.DATA[13]://Gunluk Volume
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.DAILYVOL);
                    //     ctx.reply("symb yazip sembol seciniz:", { reply_markup: KEYBOARDS.INITIAL_TR });
                    //     break;
                    // case BUTTON_LIST.DATA[14]://Saatlik Volume
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.HOURLYVOL);
                    //     ctx.reply("symb yazip sembol seciniz:", { reply_markup: KEYBOARDS.INITIAL_TR });
                    //     break;
                    // case BUTTON_LIST.DATA[15]://Birlestirilmis Volume
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.MERGEDVOL);
                    //     ctx.reply("Exchange tipini seciniz:", { reply_markup: KEYBOARDS.EXCHANGE });
                    //     break;
                    case consts_1.BUTTON_LIST.DATATR[6]: //TickerList (coinGBT)
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.TICKERLIST);
                        console.log('coingbtye basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_MP.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                    // case BUTTON_LIST.DATA[17]://Acik Kar
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.OPENINTEREST);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    default:
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        break;
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong1');
                ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
            }
        });
        this.bot.hears(consts_1.BUTTON_LIST.DATAEN, async (ctx) => {
            const message = ctx.message.text;
            const chat_id = ctx.chat.id;
            const lang = await this.db.getUserLangPrefbyID(ctx.from.id);
            try {
                switch (message) {
                    //case BUTTON_LIST.DATA[0]://Indikatorler
                    //    Queries.newQuery(chat_id, PROC_CONTEXT.INDICATOR);
                    //    ctx.reply("??ndikat??r se??iniz.", { reply_markup: KEYBOARDS.INDICATOR });
                    //    break;
                    case consts_1.BUTTON_LIST.DATAEN[0]: //Long-Short
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.LONGSHORT);
                        console.log('Longshorta basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_LS.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case consts_1.BUTTON_LIST.DATAEN[1]: //Gunluk Long-Short
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.CURRENTLS);
                        console.log('gunluk longshorta basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_GLS.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case consts_1.BUTTON_LIST.DATAEN[2]: //Likidite (Toplam)
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.TOTALLIQUIDATION);
                        console.log('likidite toplama basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_SYMB.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    // case BUTTON_LIST.DATA[4]://Likidite (BitCoin Ozel)
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.BINANCELIQUIDATION);
                    //     let LBOreply = await getBtcLiq();
                    //     ctx.reply(LBOreply, { reply_markup: KEYBOARDS.INITIAL_TR })
                    //     break;
                    // case BUTTON_LIST.DATA[5]://Likidite (Bitmex Ozel)
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.BITMEXLIQUIDATION);
                    //     ctx.reply("mp yazip coin paritesi seciniz:", { reply_markup: KEYBOARDS.INITIAL_TR });
                    //     break;
                    case consts_1.BUTTON_LIST.DATAEN[3]: //Trend Sorgu
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.TRENDINDICATOR);
                        console.log('trend sorguya basildi', ctx.from.id);
                        let TSreply = await (0, bot_functions_1.getTrendInd)(lang);
                        ctx.reply(TSreply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        Waitlist_1.waitlist.push(chat_id);
                        break;
                    // case BUTTON_LIST.DATA[7]://Hizli Hareket
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.RAPIDMOVEMENT);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    case consts_1.BUTTON_LIST.DATAEN[4]: //Hacim Akisi
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.VOLUMEFLOW);
                        console.log('hacim akisina basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_PARA.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    // case BUTTON_LIST.DATA[9]://Balina Ticareti
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.XTRADE);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    // case BUTTON_LIST.DATA[10]://Canli Ticaret
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.LIVETRADE);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    case consts_1.BUTTON_LIST.DATAEN[5]: //24 Saatlik Hacim islemi
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.HOURLY24VF);
                        console.log('24 saatlik hacim islemine basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.CHOOSE_STOCK.en, { reply_markup: keyboards_1.KEYBOARDS.STOCK });
                        break;
                    // case BUTTON_LIST.DATA[12]://OHLCV
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.OHLCV);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    // case BUTTON_LIST.DATA[13]://Gunluk Volume
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.DAILYVOL);
                    //     ctx.reply("symb yazip sembol seciniz:", { reply_markup: KEYBOARDS.INITIAL_TR });
                    //     break;
                    // case BUTTON_LIST.DATA[14]://Hourly Volume
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.HOURLYVOL);
                    //     ctx.reply("symb yazip sembol seciniz:", { reply_markup: KEYBOARDS.INITIAL_TR });
                    //     break;
                    // case BUTTON_LIST.DATA[15]://Merged Volume
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.MERGEDVOL);
                    //     ctx.reply("Exchange tipini seciniz:", { reply_markup: KEYBOARDS.EXCHANGE });
                    //     break;
                    case consts_1.BUTTON_LIST.DATAEN[6]: //TickerList (coinGBT)
                        Query_1.Queries.newQuery(chat_id, types_1.PROC_CONTEXT.TICKERLIST);
                        console.log('coingbtye basildi', ctx.from.id);
                        ctx.reply(message_data_1.default.WRITE_MP.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    // case BUTTON_LIST.DATA[17]://Acik Kar
                    //     Queries.newQuery(chat_id, PROC_CONTEXT.OPENINTEREST);
                    //     ctx.reply("Borsa t??r??n?? se??iniz:", { reply_markup: KEYBOARDS.STOCK });
                    //     break;
                    default:
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong1');
                ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        //english version will be added
        // this.bot.hears(BUTTON_LIST.INDICATOR, async (ctx) => {
        //     try {
        //         const message = ctx.message.text;
        //         const chat_id = ctx.message.chat.id;
        //         const context = PROC_CONTEXT.INDICATOR;
        //         Queries.addDataSafe(chat_id, context, message);
        //         ctx.reply("Borsa t??r??n?? se??iniz.", { reply_markup: KEYBOARDS.STOCK });
        //     } catch (error) {
        //         logger.error(error);
        //         console.log('something went wrong2');
        //         ctx.reply("Bir ??eyler yanl???? gitti. Yeniden deneyin.", { reply_markup: KEYBOARDS.INITIAL_TR });
        //     }
        // });
        this.bot.hears(consts_1.BUTTON_LIST.STOCK, async (ctx) => {
            const lang = await this.db.getUserLangPrefbyID(ctx.from.id);
            try {
                const message = ctx.message.text;
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR ')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                Query_1.Queries.addData(chat_id, message);
                switch (query.context) {
                    case types_1.PROC_CONTEXT.LONGSHORT:
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.WRITE_PA.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.WRITE_PA.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case types_1.PROC_CONTEXT.RAPIDMOVEMENT:
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.WRITE_PA.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.WRITE_PA.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case types_1.PROC_CONTEXT.OPENINTEREST:
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.WRITE_MP.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.WRITE_MP.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case types_1.PROC_CONTEXT.XTRADE:
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.WRITE_SYMB.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.WRITE_SYMB.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case types_1.PROC_CONTEXT.LIVETRADE:
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.WRITE_PA.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.WRITE_PA.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case types_1.PROC_CONTEXT.OHLCV:
                        if (lang === 'TR')
                            ctx.reply(message_data_1.default.CHOOSE_TF.tr, { reply_markup: keyboards_1.KEYBOARDS.TIMEFRAME_TR });
                        else
                            ctx.reply(message_data_1.default.CHOOSE_TF.en, { reply_markup: keyboards_1.KEYBOARDS.TIMEFRAME_EN });
                        break;
                    case types_1.PROC_CONTEXT.HOURLY24VF: // only this one is relevant for now
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.WRITE_24H.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.WRITE_24H.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                    case types_1.PROC_CONTEXT.INDICATOR:
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.CHOOSE_SOURCE.tr, { reply_markup: keyboards_1.KEYBOARDS.SOURCE_TR });
                        else
                            ctx.reply(message_data_1.default.CHOOSE_SOURCE.en, { reply_markup: keyboards_1.KEYBOARDS.SOURCE_EN });
                        break;
                    default:
                        if (lang === 'TR ')
                            ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong3');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        //english version will be added
        // this.bot.hears(BUTTON_LIST.EXCHANGE, async (ctx) => {
        //     try {
        //         const message = ctx.message.text;
        //         const chat_id = ctx.message.chat.id;
        //         const context = PROC_CONTEXT.MERGEDVOL;
        //         switch (message) {
        //             case BUTTON_LIST.EXCHANGE[0]://Spot
        //                 Queries.addDataSafe(chat_id, context, "spot");
        //                 break;
        //             case BUTTON_LIST.EXCHANGE[1]://Vadeli
        //                 Queries.addDataSafe(chat_id, context, "futures");
        //                 break;
        //             default:
        //                 ctx.reply("L??tfen ??nce i??lem se??iniz.", { reply_markup: KEYBOARDS.INITIAL_TR });
        //                 break;
        //         }
        //         ctx.reply("Zaman araligi seciniz:", { reply_markup: KEYBOARDS.TIMEFRAME_TR });
        //     } catch (error) {
        //         logger.error(error);
        //         console.log('something went wrong4');
        //         ctx.reply("Bir ??eyler yanl???? gitti. Yeniden deneyin.", { reply_markup: KEYBOARDS.INITIAL_TR });
        //     }
        // })
        // english version will be added
        // this.bot.hears(BUTTON_LIST.SOURCE_TR, async (ctx) => {
        //     try {
        //         const message = ctx.message.text;
        //         const chat_id = ctx.message.chat.id;
        //         const context = PROC_CONTEXT.INDICATOR;
        //         switch (message) {
        //             case BUTTON_LIST.SOURCE_TR[0]: //Acilis
        //                 Queries.addDataSafe(chat_id, context, "open");
        //                 break;
        //             case BUTTON_LIST.SOURCE_TR[1]://kapanis
        //                 Queries.addDataSafe(chat_id, context, "close");
        //                 break;
        //             case BUTTON_LIST.SOURCE_TR[2]: //en yuksek
        //                 Queries.addDataSafe(chat_id, context, "high");
        //                 break;
        //             case BUTTON_LIST.SOURCE_TR[3]://en dusuk
        //                 Queries.addDataSafe(chat_id, context, "low");
        //                 break;
        //             case BUTTON_LIST.SOURCE_TR[5]: //volume
        //                 Queries.addDataSafe(chat_id, context, "volume");
        //                 break;
        //             default:
        //                 ctx.reply(MSG.CHOOSE_ACTION.tr, { reply_markup: KEYBOARDS.INITIAL_TR });
        //                 break;
        //         }
        //         ctx.reply("Period yaziniz", { reply_markup: KEYBOARDS.DATA });
        //     } catch (error) {
        //         logger.error(error);
        //         console.log('something went wrong5');
        //         ctx.reply(MSG.UNKNOWN_ERROR.en, { reply_markup: KEYBOARDS.INITIAL_EN });
        //     }
        // })
        //english version will be added
        // this.bot.hears(BUTTON_LIST.TIMEFRAME_TR, async (ctx) => {
        //     try {
        //         const message = ctx.message.text;
        //         const chat_id = ctx.message.chat.id;
        //         let query = Queries.getQuery(chat_id); if (query == undefined) { ctx.reply("Lutfen once islem seciniz.", { reply_markup: KEYBOARDS.INITIAL_TR }); return; }
        //         let timeframe = ''
        //         switch (message) {
        //             case BUTTON_LIST.TIMEFRAME_TR[0]:
        //                 timeframe = '5m';
        //                 break;
        //             case BUTTON_LIST.TIMEFRAME_TR[1]:
        //                 timeframe = '15m';
        //                 break;
        //             case BUTTON_LIST.TIMEFRAME_TR[2]:
        //                 timeframe = '30m';
        //                 break;
        //             case BUTTON_LIST.TIMEFRAME_TR[3]:
        //                 timeframe = '1h';
        //                 break;
        //             case BUTTON_LIST.TIMEFRAME_TR[4]:
        //                 timeframe = '4h';
        //                 break;
        //             case BUTTON_LIST.TIMEFRAME_TR[5]:
        //                 timeframe = 'd';
        //                 break;
        //             default:
        //                 ctx.reply("L??tfen ??nce i??lem se??iniz.", { reply_markup: KEYBOARDS.INITIAL_TR });
        //                 break;
        //         }
        //         Queries.addData(chat_id, timeframe);
        //         switch (query.context) {
        //             case PROC_CONTEXT.OHLCV:
        //                 ctx.reply("pa yazip parite se??iniz. ??r: btcusdt", { reply_markup: KEYBOARDS.INITIAL_TR });
        //                 break;
        //             case PROC_CONTEXT.INDICATOR:
        //                 ctx.reply("mp yazip coin seciniz. ??r: btc-usdt", { reply_markup: KEYBOARDS.INITIAL_TR });
        //                 break;
        //             case PROC_CONTEXT.MERGEDVOL:
        //                 ctx.reply("symb yazip coin seciniz. ??r: btc", { reply_markup: KEYBOARDS.INITIAL_TR });
        //                 break;
        //             default:
        //                 ctx.reply("L??tfen ??nce i??lem se??iniz.", { reply_markup: KEYBOARDS.INITIAL_TR });
        //                 break;
        //         }
        //     } catch (error) {
        //         logger.error(error);
        //         console.log('something went wrong6');
        //         ctx.reply("Bir ??eyler yanl???? gitti. Yeniden deneyin.", { reply_markup: KEYBOARDS.INITIAL_TR });
        //     }
        // })
        this.bot.hears(/(?<=24h ).*/i, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                if (query.context == types_1.PROC_CONTEXT.HOURLY24VF) {
                    let reply = await (0, bot_functions_1.getTradeVol24h)([query.data[0], coin], lang);
                    if (lang === 'TR')
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                }
                else {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                Query_1.Queries.removeQuery(chat_id);
                Waitlist_1.waitlist.push(chat_id);
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong7');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(/^[0-9]{1,3}/, async (ctx) => {
            try {
                const message = ctx.message.text;
                const chat_id = ctx.message.chat.id;
                const lang = await this.db.getUserLangPrefbyID(chat_id);
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                if (query.context == types_1.PROC_CONTEXT.INDICATOR) {
                    Query_1.Queries.addDataSafe(chat_id, types_1.PROC_CONTEXT.INDICATOR, message);
                    ctx.reply("Zaman araligi seciniz.", { reply_markup: keyboards_1.KEYBOARDS.TIMEFRAME });
                }
                else {
                    ctx.reply("Lutfen islem seciniz", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong8');
                ctx.reply("Bir ??eyler yanl???? gitti. Yeniden deneyin.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
            }
        });
        this.bot.hears(/(?<=symb ).*/i, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                const message = ctx.message.text;
                const coin = message.split(' ');
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                let reply = "";
                switch (query.context) {
                    case types_1.PROC_CONTEXT.MERGEDVOL:
                        reply = await (0, bot_functions_1.getMergedVolume)([query.data[0], query.data[1], coin[1]]);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.XTRADE:
                        reply = await (0, bot_functions_1.getXTrade)([query.data[0], coin[1]]);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.TOTALLIQUIDATION:
                        reply = await (0, bot_functions_1.getTotalLiq)([coin[1]], lang); //?
                        if (lang === 'TR')
                            ctx.reply(reply[0], { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(reply[0], { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.HOURLYVOL:
                        reply = await (0, bot_functions_1.getHourlyVolume)([coin[1]]);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.DAILYVOL:
                        reply = await (0, bot_functions_1.getDailyVolume)([coin[1]]);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    default:
                        Query_1.Queries.removeQuery(chat_id);
                        if (lang === 'TR')
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        break;
                }
                Waitlist_1.waitlist.push(chat_id);
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong6');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(/(?<=pa ).*/i, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                let reply = "";
                switch (query.context) {
                    case types_1.PROC_CONTEXT.LIVETRADE:
                        reply = await (0, bot_functions_1.getLiveTrade)([query.data[0], coin]);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.OHLCV:
                        reply = await (0, bot_functions_1.getOhlcv)([query.data[0], query.data[1], coin]);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.RAPIDMOVEMENT:
                        reply = await (0, bot_functions_1.getRapidMov)([query.data[0], coin]);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    default:
                        if (lang === 'TR')
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                }
                Waitlist_1.waitlist.push(chat_id);
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong9');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(/(?<=mp ).*/i, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                Query_1.Queries.addData(chat_id, coin);
                let reply = "";
                switch (query.context) {
                    case types_1.PROC_CONTEXT.INDICATOR:
                        reply = await (0, bot_functions_1.getIndicator)(query.data);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.BITMEXLIQUIDATION:
                        reply = await (0, bot_functions_1.getBitmexLiq)(query.data);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.OPENINTEREST:
                        reply = await (0, bot_functions_1.getOpenInterest)(query.data);
                        ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    case types_1.PROC_CONTEXT.TICKERLIST:
                        reply = await (0, bot_functions_1.getTickerList)(query.data, lang);
                        if (lang === 'TR')
                            ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(reply, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                    default:
                        if (lang === 'TR')
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                }
                Waitlist_1.waitlist.push(chat_id);
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong10');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(/(?<=gls ).*/i, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                if (query.context == types_1.PROC_CONTEXT.CURRENTLS) {
                    let reply = await (0, bot_functions_1.getCurrentLS)([coin], lang);
                    let msg = reply[0];
                    let status = reply[1];
                    if (lang === 'TR')
                        ctx.reply(msg, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(msg, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    if (status == 200) {
                        Query_1.Queries.removeQuery(chat_id);
                        Waitlist_1.waitlist.push(chat_id);
                    }
                }
                else {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    Query_1.Queries.removeQuery(chat_id);
                    Waitlist_1.waitlist.push(chat_id);
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong11');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(/(?<=ls ).*/i, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                const message = ctx.message.text;
                const coin = message.split(' ')[1];
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                console.log("longshort secildi", query);
                switch (query.context) {
                    case types_1.PROC_CONTEXT.LONGSHORT:
                        let reply = await (0, bot_functions_1.getLongShort)([coin], lang);
                        let msg = reply[0];
                        let status = reply[1];
                        if (lang === 'TR')
                            ctx.reply(msg, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(msg, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        if (status == 200) {
                            Query_1.Queries.removeQuery(chat_id);
                            Waitlist_1.waitlist.push(chat_id);
                        }
                        break;
                    default:
                        if (lang === 'TR')
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                        else
                            ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                        Query_1.Queries.removeQuery(chat_id);
                        break;
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong12');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(/(?<=para ).*/i, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                const message = ctx.message.text;
                const coins = message.split(' ');
                const chat_id = ctx.message.chat.id;
                let query = Query_1.Queries.getQuery(chat_id);
                if (query == undefined) {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION_FIRST.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    return;
                }
                if (query.context == types_1.PROC_CONTEXT.VOLUMEFLOW) {
                    Query_1.Queries.clearData(chat_id, query.context);
                    Query_1.Queries.addDataSafe(chat_id, query.context, coins[1]);
                    Query_1.Queries.addDataSafe(chat_id, query.context, coins[2]);
                    let reply = await (0, bot_functions_1.getVolFlow)(query.data, lang);
                    let msg = reply[0];
                    let status = reply[1];
                    if (lang === 'TR')
                        ctx.reply(msg, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(msg, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    if (status == 200) {
                        Query_1.Queries.removeQuery(chat_id);
                        Waitlist_1.waitlist.push(chat_id);
                    }
                }
                else {
                    if (lang === 'TR')
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                    else
                        ctx.reply(message_data_1.default.CHOOSE_ACTION.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
                    Query_1.Queries.removeQuery(chat_id);
                    Waitlist_1.waitlist.push(chat_id);
                }
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('something went wrong13');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
        this.bot.hears(/.*/, async (ctx) => {
            const user_id = ctx.from.id;
            const lang = await this.db.getUserLangPrefbyID(user_id);
            try {
                Query_1.Queries.removeQuery(ctx.chat.id);
                if (lang === 'TR')
                    ctx.reply("Everything is fine.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply("Everything is fine.", { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
            catch (error) {
                logger_1.default.error(error);
                console.log('naaptin kral');
                if (lang === 'TR ')
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.tr, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_TR });
                else
                    ctx.reply(message_data_1.default.UNKNOWN_ERROR.en, { reply_markup: keyboards_1.KEYBOARDS.INITIAL_EN });
            }
        });
    }
    async start() {
        await this.bot.launch();
        logger_1.default.tele_bot('Telegram Bot started');
    }
    stop() {
        this.bot.stop();
        logger_1.default.tele_bot('Telegram Bot stopped');
    }
}
exports.default = TelegramBot;
