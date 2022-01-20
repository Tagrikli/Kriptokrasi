import BinanceManager from "../BinanceAPI/main";
import { EStatus, TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
import logger from "../Logger/logger";
import { profitCalculator } from "../Brain/helpers";
import { orderBeautifier} from "./beautifier_functions";
import Compositor from "./beautifier_functions";



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

export async function answerWaitingOrders(waitingOrders: TOrder[], binance_manager: BinanceManager) {
    if (waitingOrders == []) return `Bekleyen emir yok`;
    let reply = ``
    for (let i = 0; i < waitingOrders.length; i++) {
        let order_ = waitingOrders[i]
        let momentaryPrice = await binance_manager.getPriceForSymbol(order_[1]);
        if (waitingOrders[i][3] == 0) {
            reply += new Compositor(order_)
            .type()
            .symbol()
            .buy_price()
            .momentary_price(momentaryPrice)
            .tp_data()
            .stop_loss()
            .optional('Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.')
            .composed;
            /*reply += `
                SPOT
                Coin Adı:  ${waitingOrders[i][1]}
                Giriş Fiyatı :  ${waitingOrders[i][5]}
                Anlık Fiyat : 0.0885
                Emire Kalan Fiyat Farkı: ${momentaryPrice - waitingOrders[i][5]}
                TP1 : ✅ 
                TP2 : 0.099
                TP3 : 0.1031
                TP4 : 0.1071
                TP5 : 0.1261
                Stop Fiyatı : ${waitingOrders[i][6]}
                Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.`;*/
        }
        else {
            reply += `
                VADELİ
                Coin Adı:  ${waitingOrders[i][1]}
                Giriş Fiyatı :  ${waitingOrders[i][5]}
                Anlık Fiyat : 0.0885
                Emire Kalan Fiyat Farkı: ${momentaryPrice - waitingOrders[i][5]}
                Kaldıraç: ${waitingOrders[i][4]}
                TP1 : ✅ 
                TP2 : 0.099
                TP3 : 0.1031
                TP4 : 0.1071
                TP5 : 0.1261
                Stop Fiyatı : ${waitingOrders[i][6]}
                Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.`;
        }
        

    }
    return reply;
}

export async function answerActiveOrders(activeOrders: TOrder[], binance_manager: BinanceManager) {
    if (activeOrders == []) return ``;
    let reply = `-------`
    for (let i = 0; i < activeOrders.length; i++) {
        let order_ = activeOrders[i]
        let momentaryPrice = await binance_manager.getPriceForSymbol(order_[1]);
        let tps = profitCalculator(momentaryPrice, [order_[5], order_[10], order_[11], order_[12], order_[13], order_[14]], order_[4]);
        if(order_[2]==1) (await tps).forEach(tp=> tp = -tp);
        const message = new Compositor(order_)
        .type()
        .symbol()
        .buy_price()
        .momentary_profit(tps[0])
        .momentary_price(momentaryPrice)
        .tp_data()
        .stop_loss()
        .optional('Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.')
        .composed;
        
        if (activeOrders[i][3] == 0) {
            reply += `
            STOP
            Coin Adı:  ${activeOrders[i][1]}
            Giriş Fiyatı :  ${activeOrders[i][5]}
            Anlık Kâr :  % ${tps[0]}
            Anlık Fiyat : % ${momentaryPrice}
            TP1 : ${tps[1]}
            TP2 : ${tps[2]}
            TP3 : ${tps[3]}
            TP4 : ${tps[4]}
            TP5 : ${tps[5]}
            Stop Fiyatı : ${activeOrders[i][6]}
            Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.`;
        }
        else {
            reply += `
            VADELI
            Coin Adı:  ${activeOrders[i][1]}
            Giriş Fiyatı :  ${activeOrders[i][5]}
            Anlık Kâr :  % ${tps[0]}
            Anlık Fiyat : % ${momentaryPrice}
            Kaldıraç : ${activeOrders[i][4]}
            TP1 : ${tps[1]}
            TP2 : ${tps[2]}
            TP3 : ${tps[3]}
            TP4 : ${tps[4]}
            TP5 : ${tps[5]}
            Stop Fiyatı : ${activeOrders[i][6]}
            Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.`;
        }
    }

    return reply;
}


export async function answerPastOrders(pastOrders: TOrder_Past[]) {
    if (pastOrders == []) return ``;
    let reply = `-------`
    for (let i = 0; i < pastOrders.length; i++) {
        if (pastOrders[i][3] == 0) {
            reply += `
            STOP
            Tarih: ${pastOrders[i][2]}
            Coin Adı:  ${pastOrders[i][1]}
            Giriş Fiyatı :  ${pastOrders[i][6]}
            Satış Fiyatı : ${pastOrders[i][7]}
            Kar: ${pastOrders[i][8]}
            Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.`;
        }
        else {
            reply += `
            VADELI
            Tarih: ${pastOrders[i][2]}
            Coin Adı:  ${pastOrders[i][1]}
            Giriş Fiyatı :  ${pastOrders[i][6]}
            Satış Fiyatı : ${pastOrders[i][7]}
            Kaldıraç : ${pastOrders[i][5]}
            Kar: ${pastOrders[i][8]}
            Bireysel işlemlerdir. Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.`;
        }
    }
    return reply;
}


function ordersRequest(orders: TOrder[] | TOrder_Past[], type: EStatus) {

    if (orders.length) {


        




    } else {
        switch (type) {
            case EStatus.ACTIVE:
                return 'Aktif emir bulunmamaktadır.'
            case EStatus.WAITING:
                return 'Bekleyen emir bulunmamaktadır.'
            case EStatus.PAST:
                return 'Geçmiş emir bulunmamaktadır.'
        }


    }








}




export default { waitingOrderDeletion, activeOrderDeletion, waitingOrderActivation };