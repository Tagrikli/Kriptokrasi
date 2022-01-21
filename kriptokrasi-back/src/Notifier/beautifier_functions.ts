import { EPosition, EType, TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
import logger from "../Logger/logger";




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


