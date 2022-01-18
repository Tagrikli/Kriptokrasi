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



export default { waitingOrderDeletion, activeOrderDeletion };