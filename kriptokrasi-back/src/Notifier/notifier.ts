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
        position: (...d: any[]) => d[0] == EPosition.LONG ? 'LONG' : 'SHORT',
        symbol: (...d: any[]) => `Coin Adı: ${d[0]}`,
        buy_price: (...d: any[]) => `Giriş Fiyatı : ${d[0]}`,
        sell_price: (...d: any[]) => `Satış Fiyatı : ${d[0]}`,
        leverage: (...d: any[]) => `Kaldıraç : ${d[0]}`,
        profit: (...d: any[]) => `Kar: ${d[0]}`,
        momentary_profit: (...d: any[]) => `Anlık Kâr:  %${d[0]}`,
        momentary_price: (...d: any[]) => `Anlık Fiyat: ${d[0]}`,
        tp_data: (...d: any[]) => {
            let profits = d[1];

            if (profits) {
                let ind = profits.length;
                console.log(d);
                return d[0].map((v: string, i: number) => `TP${i + 1}: ${i < ind ? `✅ %${profits[i]}` : v}`).join('\n');
            } else {
                return d[0].map((v: string, i: number) => `TP${i + 1}: ${v}`).join('\n');
            }


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


    async getMomentaryPrice(symbol: string) {
        let momentary_price = 0;
        try {
            momentary_price = await this.binance.getPriceForSymbol(symbol);
        } catch (error) {
            logger.error(error);
        }
        return momentary_price;
    }



    async prepareActiveOrders() {


        let orders = await this.database.getAllOrders(EStatus.ACTIVE) as TOrder[];

        if (!orders.length) return [`Aktif emir yok`];


        return await Promise.all(orders.map(async order => {

            let momentary_price = await this.binance.getPriceForSymbol(order.symbol);
            let lastTP = await this.database.getTPByID(order.id);
            let tps = await profitCalculator(momentary_price, [order.buy_price, ...(order.tp_data as number[])], order.leverage, lastTP);

            if ((order.position === EPosition.SHORT)) tps = tps.map(tp => -tp);
            let momentary_profit = tps[0];
            let tp_data = tps.slice(1);

            if (order.type === EType.SPOT) {

                return new Compositor(order)
                    .type()
                    .symbol()
                    .buy_price()
                    .momentary_price(momentary_price)
                    .momentary_profit(momentary_profit)
                    .tp_data(tp_data)
                    .stop_loss()
                    .composed

            } else {

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
                    .composed
            }

        }));
    }


    async prepareWaitingOrders() {

        let orders = await this.database.getAllOrders(EStatus.WAITING) as TOrder[];

        if (orders.length === 0) return [`Bekleyen emir yok`];

        return await Promise.all(orders.map(async order => {

            let momentary_price = 0;
            try {
                momentary_price = await this.getMomentaryPrice(order.symbol);
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

    async preparePastOrders() {


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

     waitingOrderAdded(order:TOrder){
        return new Compositor(order)
            .optional(order.symbol, 'işlemi eklenmiştir.')
            .optional('Bekleyen emirlerden kontrol ediniz.')
            .composed
    }

    async waitingOrderActivated(order: TOrder) {

        const momentary_price = await this.getMomentaryPrice(order.symbol);

        return new Compositor(order)
            .optional(order.symbol, 'işlemine giriş yapılmıştır.')
            .buy_price()
            .composed
    }

    waitingOrderDeletion(orders: TOrder[]) {

        let prefix = `
Bekleyen emirler iptal edildi.
İptal edilen emirler:
`

        const orders_ = orders.map(order => new Compositor(order)
            .symbol()
            .buy_price()
            .composed)

        return [prefix, ...orders_].join('\n');
    }


    activeOrderDeletion(orders: TOrder[], profit:number) { //profit should be the profit of the lastTP

        let prefix = `
Aktif emirler iptal edildi.
İptal edilen emirler:
`
        const orders_ = orders.map(order => new Compositor(order)
            .symbol()
            .buy_price()
            .optional("Kâr:  %", profit)
            .composed)

        return [prefix, ...orders_].join('\n');
    }


    async activeOrderStopped(order: TOrder, profit: number, lastTP: number) {
        if (profit < 0)
        {return new Compositor(order)
            .symbol()
            .type()
            .optional('İşlem stop olmuştur.')
            .optional('Zarar: %', profit)
            .composed
        }
        else{
            return new Compositor(order)
            .symbol()
            .type()
            .optional(`İşlem TP${lastTP+1} 'de stop olmuştur.`)
            .optional('Kâr: %', profit)
            .composed
        }
    }


    tpActivated(order: TOrder, tp_no: number, profit: number) {

        return new Compositor(order)
            .symbol()
            .type()
            .optional(`TP${tp_no}`)
            .optional(`Kâr: %${profit}`)
            .composed
    }



}