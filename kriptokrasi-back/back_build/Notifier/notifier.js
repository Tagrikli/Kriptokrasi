"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../Brain/helpers");
const order_types_1 = require("../kriptokrasi-common/order_types");
const logger_1 = __importDefault(require("../Logger/logger"));
class Compositor {
    lines = [];
    order;
    fielder = {
        id: (...d) => `Id: ${d[0]}`,
        type: (...d) => d[0] === order_types_1.EType.SPOT ? 'SPOT' : 'VADELI',
        position: (...d) => d[0] == order_types_1.EPosition.LONG ? 'LONG' : 'SHORT',
        symbol: (...d) => `Coin Adı: ${d[0]}`,
        buy_price: (...d) => `Giriş Fiyatı : ${d[0]}`,
        sell_price: (...d) => `Satış Fiyatı : ${d[0]}`,
        leverage: (...d) => `Kaldıraç : ${d[0]}`,
        profit: (...d) => `Kar: ${d[0]}`,
        momentary_profit: (...d) => `Anlık Kâr:  %${d[0]}`,
        momentary_price: (...d) => `Anlık Fiyat: ${d[0]}`,
        tp_data: (...d) => {
            let profits = d[1];
            if (profits) {
                let ind = profits.length;
                return d[0].map((v, i) => `TP${i + 1}: ${i < ind ? `✅ %${profits[i]}` : v}`).join('\n');
            }
            else {
                return d[0].map((v, i) => `TP${i + 1}: ${v}`).join('\n');
            }
        },
        stop_loss: (...d) => `Stop Fiyatı: ${d[0]}`,
        timestamp: (...d) => `Tarih: ${d[0]}`,
        price_left: (...d) => `Emire Kalan Fiyat Farkı: ${d[0]}`,
        optional: (...d) => `${d.join(' ')}`
    };
    constructor(order) {
        this.order = order;
        for (const [key, value] of Object.entries(this.fielder)) {
            this[key] = this.wrapper(key, value);
        }
    }
    wrapper(key, func) {
        return (...vals) => {
            const val = this.order[key];
            this.lines.push(val !== undefined ? func(this.order[key], ...vals) : func(...vals));
            return this;
        };
    }
    newLine() {
        this.lines.push('\n');
        return this;
    }
    get composed() {
        return this.lines.join('\n');
    }
}
class Notifier {
    database;
    binance;
    async getMomentaryPrice(symbol) {
        let momentary_price = 0;
        try {
            momentary_price = await this.binance.getPriceForSymbol(symbol);
        }
        catch (error) {
            logger_1.default.error(error);
        }
        return momentary_price;
    }
    async prepareActiveOrders() {
        let orders = await this.database.getAllOrders(order_types_1.EStatus.ACTIVE);
        if (!orders.length)
            return [`Aktif emir yok`];
        return await Promise.all(orders.map(async (order) => {
            let momentary_price = await this.binance.getPriceForSymbol(order.symbol);
            let tps = await (0, helpers_1.profitCalculator)(momentary_price, [order.buy_price, ...order.tp_data], order.tp_condition, order.leverage);
            if ((order.position === order_types_1.EPosition.LONG) || (order.type === order_types_1.EType.SPOT))
                tps = tps.map(tp => -tp);
            let momentary_profit = tps[0];
            let tp_data = tps.slice(1);
            if (order.type === order_types_1.EType.SPOT) {
                return new Compositor(order)
                    .type()
                    .symbol()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .momentary_profit(momentary_profit)
                    .tp_data(tp_data)
                    .stop_loss()
                    .composed;
            }
            else {
                return new Compositor(order)
                    .type()
                    .position()
                    .symbol()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .momentary_profit(momentary_profit)
                    .leverage()
                    .tp_data(tp_data)
                    .stop_loss()
                    .composed;
            }
        }));
    }
    async prepareWaitingOrders() {
        let orders = await this.database.getAllOrders(order_types_1.EStatus.WAITING);
        if (orders.length === 0)
            return [`Bekleyen emir yok`];
        return await Promise.all(orders.map(async (order) => {
            let momentary_price = 0;
            try {
                momentary_price = await this.getMomentaryPrice(order.symbol);
            }
            catch (error) {
                logger_1.default.error(error);
            }
            let price_left = momentary_price - order.buy_price;
            if (order.type === order_types_1.EType.SPOT) {
                return new Compositor(order)
                    .type()
                    .symbol()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .price_left(price_left)
                    .tp_data()
                    .stop_loss()
                    .composed;
            }
            else {
                if (order.position == order_types_1.EPosition.SHORT)
                    price_left *= -1;
                return new Compositor(order)
                    .position()
                    .symbol()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .price_left(price_left)
                    .leverage()
                    .tp_data()
                    .stop_loss()
                    .composed;
            }
        }));
    }
    async preparePastOrders(pastOrders) {
        let orders = await this.database.getAllOrders(order_types_1.EStatus.PAST);
        if (!orders.length)
            return [`Gecmis emir yok`];
        return await Promise.all(orders.map(async (order) => {
            if (order.type === order_types_1.EType.SPOT) {
                return new Compositor(order)
                    .type()
                    .timestamp()
                    .symbol()
                    .buy_price()
                    .sell_price()
                    .profit()
                    .composed;
            }
            else {
                return new Compositor(order)
                    .position()
                    .timestamp()
                    .symbol()
                    .buy_price()
                    .sell_price()
                    .leverage()
                    .profit()
                    .composed;
            }
        }));
    }
    async waitingOrderActivated(order) {
        const momentary_price = await this.getMomentaryPrice(order.symbol);
        return new Compositor(order)
            .optional(order.symbol, 'işlemine giriş yapılmıştır.')
            .buy_price()
            .momentary_price(momentary_price)
            .composed;
    }
    waitingOrderDeletion(orders) {
        let prefix = `
Bekleyen emirler iptal edildi.
Silinen emirler:
`;
        const orders_ = orders.map(order => new Compositor(order)
            .symbol()
            .buy_price()
            .composed);
        return [prefix, ...orders_].join('\n');
    }
    async activeOrderStopped(order, profit) {
        if (profit < 0) {
            return new Compositor(order)
                .symbol()
                .type()
                .optional('İşlem stop olmuştur.')
                .optional('Zarar: %', profit)
                .composed;
        }
        else {
            return new Compositor(order)
                .symbol()
                .type()
                .optional('İşlem stop olmuştur.')
                .optional('Kâr: %', profit)
                .composed;
        }
    }
    tpActivated(order, tp_no, profit) {
        return new Compositor(order)
            .symbol()
            .type()
            .optional(`TP${tp_no}`)
            .momentary_profit(profit)
            .composed;
    }
}
exports.default = Notifier;
