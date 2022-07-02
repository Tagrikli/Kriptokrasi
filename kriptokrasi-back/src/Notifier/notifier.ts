import BinanceManager from "../BinanceAPI/main";
import { profitCalculator, profitCalculatorAfterStop } from "../Brain/helpers";
import DatabaseManager from "../Database/database";
import { EPosition, EStatus, EType, TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
import logger from "../Logger/logger";


class Compositor {
    [key: string]: any
    lines = []
    order: Partial<TOrder | TOrder_Past>

    fielder = {
        id: (...d: any[]) => `Id: ${d[0]}`,
        type_tr: (...d: any[]) => d[0] === EType.SPOT ? 'SPOT' : 'VADELI',
        type_en: (...d: any[])=> d[0] === EType.SPOT? 'SPOT' : 'FUTURES',
        position: (...d: any[]) => d[0] == EPosition.LONG ? 'LONG' : 'SHORT',
        symbol_tr: (...d: any[]) => `Coin Adı: ${d[0]}`,
        symbol_en: (...d: any[]) => `Coin Name: ${d[0]}`,
        buy_price_tr: (...d: any[]) => `Giriş Fiyatı : ${d[0]}`,
        buy_price_en: (...d: any[]) => `Buy Price : ${d[0]}`,
        sell_price_tr: (...d: any[]) => `Satış Fiyatı : ${(d[0]).toFixed(2)}`,
        sell_price_en: (...d: any[]) => `Sell Price : ${(d[0]).toFixed(2)}`,
        leverage_tr: (...d: any[]) => `Kaldıraç : ${d[0]}`,
        leverage_en: (...d: any[]) => `Leverage : ${d[0]}`,
        profit_tr: (...d: any[]) => `Kar: %${(d[0]).toFixed(2)}`,
        profit_en: (...d: any[]) => `Profit: %${(d[0]).toFixed(2)}`,
        momentary_profit_tr: (...d: any[]) => `Anlık Kâr:  %${(d[0]).toFixed(2)}`,
        momentary_profit_en: (...d: any[]) => `Momentary Profit:  %${(d[0]).toFixed(2)}`,
        momentary_price: (...d: any[]) => `Anlık Fiyat: ${(Number(d[0])).toFixed(3)}`,
        momentary_price_en: (...d: any[]) => `Momentary Price: ${(Number(d[0])).toFixed(3)}`,
        tp_data: (...d: any[]) => {
            let profits = d[1];
            if (profits) {
                let ind = profits.length;
                return d[0].map((v: string, i: number) => `TP${i + 1}: ${i < ind ? `✅ %${(profits[i]).toFixed(2)}` : v}`).join('\n');
            } else {
                return d[0].map((v: string, i: number) => `TP${i + 1}: ${v}`).join('\n');
            }
        },
        stop_loss_tr: (...d: any[]) => `Stop Fiyatı: ${d[0]}`,
        stop_loss_en: (...d: any[]) => `Stop Loss Price: ${d[0]}`,
        timestamp: (...d: any[]) =>{
            const dateObject = new Date(parseInt(d[0]))
            const humanDateFormat = dateObject.toLocaleDateString()
            return `Tarih: ${humanDateFormat}`},
        timestamp_en: (...d: any[]) => `Time: ${d[0]}`,
        price_left: (...d: any[]) => `Emire Kalan Fiyat Farkı: ${(d[0]).toFixed(2)}`,
        price_left_en: (...d: any[]) => `Price Left: ${(d[0]).toFixed(2)}`,
        optional: (...d: any[]) => `${d.join(' ')}`
    }

    constructor(order: Partial<TOrder>) {
        this.order = order

        for (const [key, value] of Object.entries(this.fielder)) {
            (this as any)[key] = this.wrapper(key, value);
        }
    }

    wrapper(key: string, func: any) {
        return (...vals) => {
            const val = this.order[key]
            this.lines.push(val !== undefined ? func(this.order[key], ...vals) : func(...vals));
            return this
        }
    }

    newLine() {
        this.lines.push('\n');
        return this;
    }

    get composed(): string {
        return this.lines.join('\n');
    }

}




export default class Notifier {

    database: DatabaseManager
    binance: BinanceManager


    async getMomentaryPrice(symbol: string, type: EType) {
        let momentary_price = 0;
        try {
            momentary_price = await this.binance.getPriceForSymbol(symbol, type);
        } catch (error) {
            logger.error(error);
        }
        return momentary_price;
    }


    async prepareActiveOrders(lang: String) {


        let orders = await this.database.getAllOrders(EStatus.ACTIVE) as TOrder[];

        if (!orders.length){
            if (lang === 'TR') return [`Aktif emir yok.`];
            else return ['No active orders.']
        } 


        return await Promise.all(orders.map(async order => {

            let momentary_price = await this.getMomentaryPrice(order.symbol, order.type);
            let lastTP = await this.database.getTPByID(order.id);
            let tps = profitCalculator(momentary_price, [order.buy_price, ...(order.tp_data as number[])], order.leverage, lastTP);
            console.log("activelere basildi", tps);

            if ((order.position === EPosition.SHORT)) tps = tps.map(tp => -tp);
            let momentary_profit = tps[0];
            let tp_data = tps.slice(1);

            if (order.type === EType.SPOT) {
                if (lang === 'EN'){
                    console.log(order);
                    return new Compositor(order)
                    .type_en()
                    .symbol_en()
                    .buy_price_en()
                    .momentary_price_en(momentary_price)
                    .momentary_profit_en(momentary_profit)
                    .tp_data(tp_data)
                    .stop_loss_en()
                    .composed
                }

                return new Compositor(order)
                    .type_tr()
                    .symbol_tr()
                    .buy_price_tr()
                    .momentary_price(momentary_price)
                    .momentary_profit_tr(momentary_profit)
                    .tp_data(tp_data)
                    .stop_loss_tr()
                    .composed

            } else {

                if (lang === 'EN'){
                    return new Compositor(order)
                    .type_en()
                    .position()
                    .symbol_en()
                    .buy_price_en()
                    .momentary_price_en(momentary_price)
                    .momentary_profit_en(momentary_profit)
                    .leverage_en()
                    .tp_data(tp_data)
                    .stop_loss_en()
                    .composed
                }

                return new Compositor(order)
                    .type_tr()
                    .position()
                    .symbol_tr()
                    .buy_price_tr()
                    .momentary_price_tr(momentary_price)
                    .momentary_profit_tr(momentary_profit)
                    .leverage_tr()
                    .tp_data(tp_data)
                    .stop_loss_tr()
                    .composed
            }

        }));
    }


    async prepareWaitingOrders() {

        let orders = await this.database.getAllOrders(EStatus.WAITING) as TOrder[];

        if (orders.length === 0) return [`Bekleyen emir yok`];

        return await Promise.all(orders.map(async order => {

            let momentary_price = await this.getMomentaryPrice(order.symbol, order.type);
            let price_left = momentary_price - order.buy_price;
            if (order.type === EType.SPOT) {

                return new Compositor(order)
                    .type_tr()
                    .symbol_tr()
                    .buy_price_tr()
                    .momentary_price(momentary_price)
                    .price_left(price_left)
                    .tp_data()
                    .stop_loss_tr()
                    .composed

            } else {

                if (order.position === EPosition.SHORT) price_left *= -1;

                return new Compositor(order)
                    .position()
                    .symbol_tr()
                    .buy_price_tr()
                    .momentary_price(momentary_price)
                    .price_left(price_left)
                    .leverage_tr()
                    .tp_data()
                    .stop_loss_tr()
                    .composed
            }
        }));
    }

    async preparePastOrders() {

        let orders = await this.database.getAllOrders(EStatus.PAST) as TOrder_Past[];
        if (!orders.length) return [`Gecmis emir yok`];
        return await Promise.all(orders.map(async order => {
            if (order.type === EType.SPOT) {
                return new Compositor(order)
                    .type_tr()
                    .timestamp()
                    .symbol_tr()
                    .buy_price_tr()
                    .sell_price_tr()
                    .profit_tr()
                    .composed

            } else {
                return new Compositor(order)
                    .position()
                    .timestamp()
                    .symbol_tr()
                    .buy_price_tr()
                    .sell_price_tr()
                    .leverage_tr()
                    .profit_tr()
                    .composed
            }
        }));

    }

    async waitingOrderAdded(order: TOrder) {
        let momentary_price = await this.getMomentaryPrice(order.symbol, order.type);
        let price_left = momentary_price - order.buy_price;
        
        if (order.type === EType.SPOT) {
            return new Compositor(order)
            .optional(order.symbol, 'işlemi eklenmiştir.')
            .type_tr()
            .buy_price_tr()
            .momentary_price(momentary_price)
            .price_left(price_left)
            .tp_data()
            .stop_loss_tr()
            .optional('Bekleyen emirlerden kontrol ediniz.')
            .composed
        }else{
            return new Compositor(order)
            .optional(order.symbol, 'işlemi eklenmiştir.')
            .type_tr()
            .position()
            .buy_price_tr()
            .momentary_price(momentary_price)
            .price_left(price_left)
            .tp_data()
            .stop_loss_tr()
            .optional('Bekleyen emirlerden kontrol ediniz.')
            .composed
        }
    }

    async waitingOrderActivated(order: TOrder) {

        return new Compositor(order)
            .optional(order.symbol, 'işlemine giriş yapılmıştır.')
            .buy_price_tr()
            .composed
    }

    waitingOrderDeletion(orders: TOrder[]) {

        let prefix = `
Bekleyen emirler iptal edildi.
İptal edilen emirler:
`

        const orders_ = orders.map(order =>
            new Compositor(order)
                .symbol_tr()
                .buy_price_tr()
                .composed)

        return [prefix, ...orders_].join('\n');
    }


    activeOrderDeletion(orders: TOrder[], profits: { [key: number]: any }) { //profit should be the profit of the lastTP

        let prefix = `
Aktif işlem kapanmıştır.
Kapanan emirler:
`
        const orders_ = orders.map(order =>
            new Compositor(order)
                .symbol_tr()
                .buy_price_tr()
                .optional(`Kâr: %${parseFloat(profits[order.id]).toFixed(3)}`)
                .composed
        )

        return [prefix, ...orders_].join('\n');
    }


    async activeOrderStopped(order: TOrder, profit: number, lastTP: number, buy_price:number) {
        let reg_profit = profitCalculatorAfterStop(buy_price, [order.buy_price, ...(order.tp_data as number[])], order.leverage, lastTP);
        //if ((order.position === EPosition.SHORT)) reg_profit = reg_profit.map(tp => -tp);

        if (profit < 0) {
            return new Compositor(order)
                .symbol_tr()
                .type_tr()
                .optional('İşlem stop olmuştur.')
                .optional('Zarar: %', profit.toFixed(2))
                .composed
        }
        else {
            return new Compositor(order)
                .symbol_tr()
                .type_tr()
                .optional(`Kâr: %${profit.toFixed(3)}`)
                .optional(`İşlem TP${lastTP + 1} 'de stop olmuştur.`)
                .optional('Parçalı Satış Sonrası Kâr: %', reg_profit[lastTP+1].toFixed(3))
                .composed
        }
    }


    tpActivated(order: TOrder, tp_no: number, profit: number) {

        return new Compositor(order)
            .symbol_tr()
            .type_tr()
            .optional(`TP${tp_no}`)
            .optional(`Kâr: %${profit.toFixed(2)}`)
            .composed
    }

}