import { BasicSymbolParam, MainClient, SymbolPrice, WebsocketClient } from 'binance';
import logger from '../Logger/logger';
import Brain from '../Brain/main';



class BinanceManager {
    client: MainClient
    wsClient: WebsocketClient
    symbols: string[]
    onBookTicker: (data: any) => void;

    constructor() {
        this.symbols = [];

        this.client = new MainClient();
        this.wsClient = new WebsocketClient({ beautify: true });

        this.wsClient.on('formattedMessage', (data) => this.onFormattedMessage(data));

    }



    bindOnBookTicker(callback: any) {
        this.onBookTicker = callback;
    }


    initSubscriptions() {
        this.wsClient.subscribeAllBookTickers('spot')
    }

    async getAllSymbols() {
        const result = await this.client.getExchangeInfo();
        return result.symbols.map(symbol => symbol.symbol);
    }

    async getPriceForSymbol(symbol: string): Promise<number> {
        const result = await this.client.getSymbolPriceTicker({ symbol: symbol });
        return (result as SymbolPrice).price as number;
    }

    updateSymbols(symbols: string[]) {
        this.symbols = symbols;
    }

    onFormattedMessage(data: any) {


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



export default BinanceManager;


