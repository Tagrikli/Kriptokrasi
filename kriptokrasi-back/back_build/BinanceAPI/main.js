"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binance_1 = require("binance");
class BinanceManager {
    client;
    wsClient;
    symbols;
    onBookTicker;
    constructor() {
        this.symbols = [];
        this.client = new binance_1.MainClient();
        this.wsClient = new binance_1.WebsocketClient({ beautify: true });
        this.wsClient.on('formattedMessage', (data) => this.onFormattedMessage(data));
    }
    bindOnBookTicker(callback) {
        this.onBookTicker = callback;
    }
    initSubscriptions() {
        this.wsClient.subscribeAllBookTickers('spot');
    }
    async getAllSymbols() {
        const result = await this.client.getExchangeInfo();
        return result.symbols.map(symbol => symbol.symbol);
    }
    async getPriceForSymbol(symbol) {
        const result = await this.client.getSymbolPriceTicker({ symbol: symbol });
        return result.price;
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
