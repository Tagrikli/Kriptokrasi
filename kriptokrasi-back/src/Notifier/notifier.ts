import { privateDecrypt } from "crypto";
import BinanceManager from "../BinanceAPI/main";
import { profitCalculator } from "../Brain/helpers";
import DatabaseManager from "../Database/database";
import { EPosition, EStatus, EType, TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
import logger from "../Logger/logger";


class Compositor {
    [key: string]: any
    lines = []
    order: Partial<TOrder | TOrder_Past>

    fielder = {
        id: (...d: any[]) => `Id: ${d[0]}`,
        type: (...d: any[]) => d[0] === EType.SPOT ? 'SPOT' : 'VADELI',
        position: (...d: any[]) => d[0] === EPosition.LONG ? 'LONG' : 'SHORT',
        symbol: (...d: any[]) => `Coin Adı: ${d[0]}`,
        buy_price: (...d: any[]) => `Giriş Fiyatı : ${d[0]}`,
        sell_price: (...d: any[]) => `Satış Fiyatı : ${d[0]}`,
        leverage: (...d: any[]) => `Kaldıraç : ${d[0]}`,
        profit: (...d: any[]) => `Kar: ${d[0]}`,
        momentary_profit: (...d: any[]) => `Anlık Kâr:  %${d[0]}`,
        momentary_price: (...d: any[]) => `Anlık Fiyat: ${d[0]}`,
        tp_data: (...d: any[]) => {

            return d[0].map((v: string, i: number) => `TP${i + 1}: ${v.charAt(0)  === '%' ? '✅' : v}`).join('\n');

        },
        stop_loss: (...d: any[]) => `Stop Fiyatı: ${d[0]}`,
        timestamp: (...d: any[]) => `Tarih: ${d[0]}`,
        price_left: (...d: any[]) => `Emire Kalan Fiyat Farkı: ${d[0]}`,
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
            this.lines.push(val ? func(this.order[key], ...vals) : func(...vals));
            return this
        }
    }

    optional(message: string) {
        this.lines.push(message);
        return this
    }


    get composed(): string {
        return this.lines.join('\n');
    }

}




export default class Notifier {

    database: DatabaseManager
    binance: BinanceManager


    async prepareActiveOrders() {


        let orders = await this.database.getAllOrders(EStatus.ACTIVE) as TOrder[];

        if (!orders.length) return [`Aktif emir yok`];


        return await Promise.all(orders.map(async order => {

            let momentary_price = await this.binance.getPriceForSymbol(order.symbol);
            let tps = profitCalculator(momentary_price, [order.buy_price, ...(order.tp_data as number[])], order.leverage);

            if (order.position === EPosition.SHORT) tps = tps.map(tp => -tp);

            if (order.type === EType.SPOT) {

                return new Compositor(order)
                    .type()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .momentary_profit()
                    .tp_data()
                    .stop_loss()
                    .composed

            } else {
                return new Compositor(order)
                    .position()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .momentary_profit()
                    .leverage()
                    .tp_data()
                    .stop_loss()
                    .composed
            }

        }));
    }


    async prepareWaitingOrders() {

        let orders = await this.database.getAllOrders(EStatus.WAITING) as TOrder[];
        console.log(orders);

        if (!orders.length) return [`Bekleyen emir yok`];

        return await Promise.all(orders.map(async order => {

            let momentary_price = 0;
            try {
                momentary_price = await this.binance.getPriceForSymbol(order.symbol);
            } catch (error) {
                logger.error(error);
            }
            let price_left = momentary_price - order.buy_price;
            if (order.type === EType.SPOT) {

                return new Compositor(order)
                    .type()
                    .symbol()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .price_left(price_left)
                    .tp_data()
                    .stop_loss()
                    .composed

            } else {
                
                if (order.position == EPosition.SHORT) price_left *= -1;

                return new Compositor(order)
                    .position()
                    .symbol()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .price_left(price_left)
                    .leverage()
                    .tp_data()
                    .stop_loss()
                    .composed
            }
        }));
    }

    async preparePastOrders(pastOrders: TOrder_Past[]) {


        let orders = await this.database.getAllOrders(EStatus.PAST) as TOrder_Past[];

        if (!orders.length) return [`Gecmis emir yok`];

        return await Promise.all(orders.map(async order => {

            if (order.type === EType.SPOT) {

                return new Compositor(order)
                    .type()
                    .timestamp()
                    .symbol()
                    .buy_price()
                    .sell_price()
                    .profit()
                    .composed

            } else {

                return new Compositor(order)
                    .position()
                    .timestamp()
                    .symbol()
                    .buy_price()
                    .sell_price()
                    .leverage()
                    .profit()
                    .composed

            }


        }));

    }


    async orderSummary(order: TOrder) {



        const order_ = order as TOrder;

        const message = new Compositor(order_)
            .type()
            .symbol()
            .buy_price()
            .momentary_profit(0.9999)
            .momentary_price(0.9999)
            .leverage()
            .tp_data()
            .stop_loss()
            .optional('Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.')
            .composed;



    }




}