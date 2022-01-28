import axios from "axios";
import BinanceManager from "../BinanceAPI/main";
import { TOrder, TOrder_Past } from "../kriptokrasi-common/order_types";
import logger from "../Logger/logger";


export async function getIndicator(data: string[]) {
    const ind = data[0].toLowerCase();
    const e = data[1].toLowerCase();
    const tf = data[4];
    const source = data[2]
    const period = data[3]
    let msg = ``
    try{
        const market_pair = data[5].toUpperCase();
        let response = await axios.get(`https://api.cryptometer.io/indicator-${ind}/?market_pair=${market_pair}&source=${source}&e=${e}&period=${period}&timeframe=${tf}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = `${response.data["data"][0]}`;
    } catch{
        console.log("indicator mistake");
        msg = `yanlis coin`;
    }
    return msg;
}



export async function getLongShort(data: string[]) {
    let msg = ``;
    try {
        const pair = data[0].toUpperCase();
        
        let response1 = await axios.get(`https://api.cryptometer.io/ls-ratio/?pair=${pair}&e=binance_futures&timeframe=15m&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        let response2 = await axios.get(`https://api.cryptometer.io/ls-ratio/?pair=${pair}&e=binance_futures&timeframe=1h&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        let response3 = await axios.get(`https://api.cryptometer.io/ls-ratio/?pair=${pair}&e=binance_futures&timeframe=4h&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        let response4 = await axios.get(`https://api.cryptometer.io/ls-ratio/?pair=${pair}&e=binance_futures&timeframe=d&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
    
        let pressure1 = `Long {up}`
        if ((response1.status == 200) && (parseFloat(response1.data['data'][0]["buy"]) < 50.0))
            pressure1 = `Sell {down}`
        let pressure2 = `Long {up}`
        if ((response2.status == 200) && (parseFloat(response2.data['data'][0]["buy"]) < 50.0))
            pressure2 = `Sell {down}`
        let pressure3 = `Long {up}`
        if ((response3.status == 200) && (parseFloat(response3.data['data'][0]["buy"]) < 50.0))
            pressure3 = `Sell {down}`
        let pressure4 = `Long {up}`
        if ((response4.status == 200) && (parseFloat(response4.data['data'][0]["buy"]) < 50.0))
            pressure4 = `Sell {down}`
        msg = `15Dakika -> Ratio: ${response1.data['data'][0]["ratio"]} -> ${pressure1} \n 1 Saat -> Ratio: ${response2.data['data'][0]["ratio"]} -> ${pressure2} \n 4 Saat -> Ratio: ${response3.data['data'][0]["ratio"]} -> ${pressure3} \n 1 Gun -> Ratio: ${response4.data['data'][0]["ratio"]} -> ${pressure4}`;
    } catch{
        msg = `Coin yazmayı tekrar deneyin. ör: ls btc-usdt`
    }
    
    return msg
}

export async function getCurrentLS(data: string[]) {
    let msg =``;
    try{
        const symbol = data[0].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/current-day-long-short-v2/?symbol=${symbol}&e=binance_futures&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = `Longs: ${response.data["data"][0]["longs"]}, Shorts: ${response.data["data"][0]["shorts"]}`;
    }catch{
        console.log("currentLS mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getTotalLiq(data: string[]) {
    let msg =``;
    try{
        const symbol = data[0].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/liquidation-data-v2/?symbol=${symbol}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg =response.data["data"][0]
    } catch{
        console.log("totalLiq mistake");
        msg = `yanlis coin`;
    }
    

    return msg;
}

export async function getBtcLiq() {
    let msg = ``;
    try{
        let response = await axios.get(`https://api.cryptometer.io/liquidation-data/?&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = `Longs: ${response.data["data"]['longs']}  Shorts: ${response.data["data"]['shorts']}`;
    } catch{
        console.log("BtcLiq mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getBitmexLiq(data: string[]) {
    let msg =``;
    try{
        const market_pair = data[0].toUpperCase();
        let response = await axios.get(`https://api.cryptometer.io/bitmex-liquidation/?market_pair=${market_pair}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        let msg = `Miktar: ${response.data["data"][0]['quantity']}   Taraf: ${response.data["data"][0]['side']}`;
    } catch{
        console.log("bitmexliq mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getTrendInd() {
    let response = await axios.get(`https://api.cryptometer.io/trend-indicator-v3/?api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
    let msg = `Trend Skoru: ${response.data["data"][0]['trend_score']} \n Alış Baskısı: ${response.data["data"][0]['buy_pressure']} \n Satış Baskısı: ${response.data["data"][0]['sell_pressure']}`

    return msg;
}


export async function getRapidMov(data: string[]) { //data: pair exchange
    let msg = ``;
    try{
        let response = await axios.get(`https://api.cryptometer.io/rapid-movements/?api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = "Coinde son bir saat icerisinde dump yada pump hareketi bulunamadi";
        const pair = data[1].toUpperCase()
        for (let i = 0; i < response.data["data"].length; i++) {
            if (response.data["data"][i]["pair"] == pair) {
                if (response.data["data"][i]["exchange"] == data[0].toLowerCase()) {
                    msg = `pair:${response.data["data"][i]['pair']}, exchange:${response.data["data"][i]['exchange']}, değişim:${response.data["data"][i]['change_detected']}, taraf:${response.data["data"][i]['side']}`
                }
            }
        }
    } catch{
        console.log("rapid movement mistake");
        msg = `yanlis coin`;
    }
    
    return msg
}

export async function getVolFlow(data: string[]) { //data: timeframe fromcoin tocoin
    let msg = ``;
    const timeframes = ['15m', '1h', '4h', 'd'];
    const timeframesTR = ['15 Dakika', '1 Saat', '4 Saat', '1 Gün'];
    try{
        const fromCoin = data[0].toUpperCase();
        const toCoin = data[1].toUpperCase();
        for (let j=0; j< 4; j++){
            let response = await axios.get(`https://api.cryptometer.io/volume-flow/?timeframe=${timeframes[j]}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
            let buy_flow = response.data["data"]["buy_flow"]
            let sell_flow = response.data["data"]['sell_flow']
            let vol = 0.0
            let found = false; //false means sell
            for (let i = 0; i < buy_flow.length; i++) {
                if ((buy_flow[i]["from"] == fromCoin) && (buy_flow[i]["to"] == toCoin)) {
                    vol = buy_flow[i]["volume"]
                    msg += `${timeframesTR[j]}=> Volume: ${vol}, Akış: Alım
    `
                }
            }
            if (!found) {
                for (let i = 0; i < sell_flow.length; i++) {
                    if ((sell_flow[i]["from"] == fromCoin) && (sell_flow[i]["to"] == toCoin)) {
                        vol = sell_flow[i]["volume"]
                        msg += `${timeframesTR[j]}=> Volume: ${vol}, Akış: Satım
    `
                    }
                }
            }
        }
        if (msg === ``) msg = `Aradığınız coinlerde hacim akışı bulunamadı.`
    }catch{
        console.log("volume flow mistake");
        msg = `yanlis coin`;
    }
    
    return msg
}

export async function getXTrade(data: string[]) {

    const e = data[0].toLowerCase();
    let msg =``;
    try{
        const symbol = data[1].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/xtrades/?symbol=${symbol}&e=${e}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        if (response.data['success'] == false) {
            return "Yanlis exchange - parite"
        }


        let maxB = 0.0
        let maxS = 0.0
        for (let i = 0; i < response.data["data"].length; i++) {
            if (response.data["data"][i]["side"] == "BUY") {
                if (parseFloat(response.data["data"][i]["price"]) > maxB)
                    maxB = parseFloat(response.data["data"][i]["price"]);
            }
            if (response.data["data"][i]["side"] == "SELL") {
                if (parseFloat(response.data["data"][i]["price"]) > maxS)
                    maxS = parseFloat(response.data["data"][i]["price"]);
            }
        }
        msg = `Son 3 fiyat: \n ${response.data["data"][0]['price']} \n ${response.data["data"][1]['price']} \n ${response.data["data"][2]['price']} \n Max Buy: ${maxB}    Max Sell: ${maxS}`;
    }catch{
        console.log("xtrade mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getLiveTrade(data: string[]) {
    const e = data[0].toLowerCase();
    let msg =``;
    try{
        const pair = data[1].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/live-trades/?pair=${pair}&e=${e}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = response.data["data"]
    }catch{
        console.log("live trade mistake");
        msg = `yanlis coin`;
    }


    return msg;
}

export async function getTradeVol24h(data: string[]) {
    const e = data[0].toLowerCase();
    let msg =``;
    try{
        const pair = data[1].toUpperCase();
        let response = await axios.get(`https://api.cryptometer.io/24h-trade-volume-v2/?pair=${pair}&e=${e}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = `Alis: ${response.data["data"][0]["buy"]}  Satis: ${response.data["data"][0]["sell"]}`;
    } catch{
        console.log("tradevol 24h mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getOhlcv(data: string[]) {
    const tf = data[1]
    const e = data[0].toLowerCase();
    let msg =``;
    try{
        const pair = data[2].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/ohlcv/?timeframe=${tf}&pair=${pair}&e=${e}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);

        let maxO = 0.0
        let maxC = 0.0
        let maxH = 0.0
        let maxL = 0.0
        let maxV = 0.0
        let maxB = 0.0
        let maxS = 0.0
        let maxBT = 0.0
        let maxST = 0.0
        for (let i = 0; i < response.data["data"].length; i++) {
            if (response.data["data"][i]["open"] > maxO)
                maxO = response.data["data"][i]["open"]
            if (response.data["data"][i]["close"] > maxC)
                maxC = response.data["data"][i]["close"]
            if (response.data["data"][i]["high"] > maxH)
                maxH = response.data["data"][i]["high"]
            if (response.data["data"][i]["low"] > maxL)
                maxL = response.data["data"][i]["low"]
            if (response.data["data"][i]["volume"] > maxV)
                maxV = response.data["data"][i]["volume"]
            if (response.data["data"][i]["buy"] > maxB)
                maxB = response.data["data"][i]["buy"]
            if (response.data["data"][i]["sell"] > maxS)
                maxS = response.data["data"][i]["sell"]
            if (response.data["data"][i]["buy_total"] > maxBT)
                maxBT = response.data["data"][i]["buy_total"]
            if (response.data["data"][i]["sell_total"] > maxST)
                maxST = response.data["data"][i]["sell_total"];
        }
        msg = `Max Open değer: ${maxO} \n Max Kapanis değer: ${maxC} \n Max Yuksek değer: ${maxH} \n Max dusus değer: ${maxL} \n Max Hacim değeri:${maxV} \n Max Alim değeri: ${maxB}\n Max Satis değeri: ${maxS} \n Max Alis toplam değer: ${maxBT} \n Max Satis toplam değeri: ${maxST}`;
    }catch{
        console.log("ohlcv mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getDailyVolume(data: string[]) {
    let msg =``;
    try{
        const symbol = data[0].toUpperCase();
        let response = await axios.get(`https://api.cryptometer.io/current-day-merged-volume-v2/?symbol=${symbol}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg =  response.data["data"]
    }catch{
        console.log("daily volume mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getHourlyVolume(data: string[]) {
    let msg =``;
    try{
        const symbol = data[0].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/hourly-buy-sell-merged-volume/?symbol=${symbol}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = `${response.data["data"]}`;
    }catch{
        console.log("hourly volume mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getMergedVolume(data: string[]) {
    const exhange_type = data[0]; //spot or futures
    const timeframe = data[1];
    let msg =``;
    try{
        const symbol = data[2].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/merged-trade-volume/?symbol=${symbol}&exchange_type=${exhange_type}&timeframe=${timeframe}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        msg = `Alim: ${response.data["data"][0]["buy"]} ve Satim: ${response.data["data"][0]["sell"]}`;
    }catch{
        console.log("merged volume api mistake");
        msg = 'Coini yanlis girmis olabilirsiniz';
    }
   

    return msg;
}


export async function getTickerList(data: string[]) {
    const e = data[0].toLowerCase();
    let msg =``;
    try{
        const pair = data[1].toUpperCase();
        let response = await axios.get(`https://api.cryptometer.io/tickerlist-pro/?&e=${e}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        for (let i = 0; i < response.data["data"].length; i++) {
            if (response.data["data"][i]["market_pair"] == pair) {
                msg = `market_pair: ${response.data["data"][i]["market_pair"]}
                symbol: ${response.data["data"][i]["symbol"]}
                fiyat: ${response.data["data"][i]["price"]}
                usd fiyatı: ${response.data["data"][i]["usd_price"]}
                high: ${response.data["data"][i]["high"]}
                low: ${response.data["data"][i]["low"]}
                volume_24: ${response.data["data"][i]["volume_24"]}
                change_24h: ${response.data["data"][i]["change_24h"]}
                change_1h: ${response.data["data"][i]["change_1h"]}
                change_7d: ${response.data["data"][i]["change_7h"]}
                change_30d: ${response.data["data"][i]["change_24h"]}
                change_90d:-37.67
                change_ytd:-23.7`;
                break;
            }
        }
    }catch{
        console.log("tickerlist mistake");
        msg = `yanlis coin`;
    }
    return msg;
}

export async function getOpenInterest(data: string[]) {
    const e = data[0].toLowerCase();
    let msg = ""
    try{
        const market_pair = data[1].toLowerCase();
        let response = await axios.get(`https://api.cryptometer.io/merged--trade-volume/?market_pair=${market_pair}&e=${e}&api_key=fT3TiQG131f3ZEqVPmK45WeFZJ90Z4pPpk6XYf1e`);
        if (response.status != 200)
            msg = "Toplam veri yetersiz.";
    }catch{
        console.log("live trade mistake");
        msg = `yanlis coin`;
    }
    return msg;
}




export async function sendActivationMessage(symbol: string, type: string) {
    let tempType = 'spot';
    if (type != 'spot') tempType = 'long islem';
    let message = `${symbol} ${tempType} işlemine giriş yapılmıştır.`
    return message;
}

export async function sendPastOrderMessage(symbol: string, buy_price: number, type: string, binance_manager: BinanceManager) {
    let tempType = 'spot';
    if (type != 'spot') tempType = 'long islem';
    const momentaryPrice = await binance_manager.getPriceForSymbol(symbol);
    const momentaryProfit = (buy_price - momentaryPrice) * (100 / buy_price);
    let message =
        `Coin : ${symbol} 
    Tip: ${tempType}
    Alış Fiyatı : ${buy_price} 
    Satış Fiyatı : ${momentaryPrice}
    Zarar: % ${momentaryProfit}
    İşlem kapanmıştır`;
    return message;
}
export async function sendTPMessage(symbol: string,) {
    let message = `${symbol} 
    vadeli TP3 ✅
    Kar : %14.711`;
    return message;
}

