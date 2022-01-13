import { MainClient, WebsocketClient } from 'binance';
import { logger } from '../Logger/logger';
import { brain } from '../Brain/main';



class BinanceManager {
    client: MainClient
    wsClient: WebsocketClient
    symbols: string[]


    constructor() {
        this.client = new MainClient();
        this.wsClient = new WebsocketClient({ beautify: true });
        this.wsClient.on('formattedMessage', this.onFormattedMessage);

        this.symbols = [];
    }

    initSubscriptions() {
        this.wsClient.subscribeAllBookTickers('spot')
    }

    async getAllSymbols() {
        const result = await this.client.getExchangeInfo();
        return result.symbols.map(symbol => symbol.symbol);
    }


    updateSymbols(symbols: string[]) {
        this.symbols = symbols;
    }

    onFormattedMessage(data) {

        const event_type = data.eventType;


        switch (event_type) {
            case 'bookTicker':
                brain.onBinanceBookTicker(data);
                break;


            default:
                break;
        }
    }

}

const binance_manager = new BinanceManager();
binance_manager.initSubscriptions();

export { binance_manager };