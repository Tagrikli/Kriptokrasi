import { TOrder } from "../kriptokrasi-common/order_types";

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



export function orderPastBeautifier() {



}