import { EPosition, EType, TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
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
        momentary_price: (...d: any[]) => `Anlık Fiyat: %${d[0]}`,
        tp_data: (...d: any[]) => d.map((v, i) => `TP${i + 1}: ${v}`).join('\n'),
        stop_loss: (...d: any[]) => `Stop Fiyatı: ${d[0]}`,
        timestamp: (...d: any[]) => `Tarih: ${d[0]}`
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
        return '\n' + this.lines.join('\n') + '\n';
    }

}
export default Compositor;




export function orderBeautifier(orders: TOrder | TOrder[]) {

    const a_variable_name = (order: TOrder) => `
Sembol: ${order.symbol}
Alis Fiyati: ${order.buy_price}`;


    let orders_: TOrder[];
    Array.isArray(orders) ? orders_ = orders.slice() : orders_.push(orders);

    let message = '';
    message += orders_.map(order => a_variable_name(order)).join('\n');


    return message;
}


export function orderSummary(order: TOrder | TOrder_Past, past: boolean, momentary_price?: number, tps?: number[]) {


    if (!past) {

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


    } else {

        const order_ = order as TOrder_Past

        `
        ${order_.type === EType.SPOT ? 'SPOT' : order_.position === EPosition.LONG ? 'VADELI (LONG)' : 'VADELI (SHORT)'}
        Tarih: ${order_.timestamp}
        Coin Adı:  ${order_.symbol}
        Giriş Fiyatı :  ${order_.buy_price}
        Satış Fiyatı : ${order_.sell_price}
        Kar: ${order_.profit}
        Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.`;
    }

}




export function beautifyOrders(orders: TOrder | TOrder[]) {


    let orders_: TOrder[];
    Array.isArray(orders) ? orders_ = orders.slice() : orders_.push(orders);

    let message = '';

    orders_.map(order => {











    })




    return message;
}