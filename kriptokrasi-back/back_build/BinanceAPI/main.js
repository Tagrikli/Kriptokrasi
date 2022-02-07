"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binance_1 = require("binance");
const order_types_1 = require("../kriptokrasi-common/order_types");
class BinanceManager {
    spotClient;
    usdmClient;
    wsClient;
    symbols;
    onBookTicker;
    constructor() {
        this.symbols = [];
        this.spotClient = new binance_1.MainClient();
        this.usdmClient = new binance_1.USDMClient();
        this.wsClient = new binance_1.WebsocketClient({ beautify: true });
        this.wsClient.on('formattedMessage', (data) => this.onFormattedMessage(data));
    }
    bindOnBookTicker(callback) {
        this.onBookTicker = callback;
    }
    initSubscriptions() {
        this.wsClient.subscribeAllBookTickers('spot');
        this.wsClient.subscribeAllBookTickers('usdm');
    }
    async getAllSymbols(type) {
        let result;
        if (type === order_types_1.EType.SPOT) {
            result = await this.spotClient.getExchangeInfo();
        }
        else if (type === order_types_1.EType.VADELI) {
            result = await this.usdmClient.getExchangeInfo();
        }
        return result.symbols.map((symbol) => symbol.symbol);
    }
    async getPriceForSymbol(symbol, type) {
        let result;
        if (type === order_types_1.EType.SPOT) {
            result = (await this.spotClient.getSymbolPriceTicker({ symbol: symbol }));
        }
        else if (type === order_types_1.EType.VADELI) {
            result = (await this.usdmClient.getSymbolPriceTicker({ symbol: symbol }));
        }
        return parseFloat(result.price.toString());
    }
    updateSymbols(symbols) {
        this.symbols = symbols;
    }
    onFormattedMessage(data) {
        const event_type = data.eventType;
        switch (event_type) {
            case 'bookTicker':
                this.onBookTicker(data);
                break;
            default:
                break;
        }
    }
}
exports.default = BinanceManager;
