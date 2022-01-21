import BinanceManager from "../BinanceAPI/main";
import { EPosition, EStatus, EType, TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
import logger from "../Logger/logger";
import { profitCalculator } from "../Brain/helpers";
import { orderBeautifier } from "./beautifier_functions";



function activeOrderStop(orders: TOrder[]) {

    let notif = `
İşlem stop olmuştur.

`

    return notif;
}



function waitingOrderDeletion(orders: TOrder[]) {

    let notif = `
Bekleyen emirler iptal edildi.
Silinen emirler:
${orderBeautifier(orders)}`;

    return notif;
}


function activeOrderDeletion(orders: TOrder[]) {
    let notif = `
Aktif emirler iptal edildi.
Silinen emirler:
${orderBeautifier(orders)}`;

    return notif;
}

function waitingOrderActivation(order: TOrder, bid_price: number) {

    let notif = `
${order.symbol} işlemine giriş yapılmıştır.
Alış fiyatı: ${order.buy_price}
Anlık fiyat: ${bid_price}`;

    return notif;


}









export default { waitingOrderDeletion, activeOrderDeletion, waitingOrderActivation };