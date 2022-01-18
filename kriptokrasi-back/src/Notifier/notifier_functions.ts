import { TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
import logger from "../Logger/logger";
import { orderBeautifier } from "./beautifier_functions";




function waitingOrderDeletion(orders: TOrder[]) {

    let notif = `
Bekleyen emirler silindi.
Silinen emirler:
${orderBeautifier(orders)}`;

    return notif;
}


function activeOrderDeletion(orders: TOrder[]) {
    let notif = `
Aktif emirler silindi.
Silinen emirler:
${orderBeautifier(orders)}`;

    return notif;
}

function waitingOrderActivation(order: TOrder, bid_price: number) {

    let notif = `
${order.symbol} islemine giris yapilmistir.
Alis fiyati: ${order.buy_price}
Anlik fiyat: ${bid_price}`;

    return notif;


}



export default { waitingOrderDeletion, activeOrderDeletion, waitingOrderActivation };