import { BasicSymbolParam, ExchangeInfo, FuturesExchangeInfo, MainClient, SymbolPrice, USDMClient, WebsocketClient } from 'binance';
import logger from '../Logger/logger';
import Brain from '../Brain/main';
import { EType } from '../kriptokrasi-common/order_types';
import { identity } from 'lodash';



class BinanceManager {
    spotClient: MainClient
    usdmClient: USDMClient
    wsClient: WebsocketClient
    symbols: string[]
    onBookTicker: (data: any) => void;

    constructor() {
        this.symbols = [];

        this.spotClient = new MainClient();
        this.usdmClient = new USDMClient();
        this.wsClient = new WebsocketClient({ beautify: true });

        this.wsClient.on('formattedMessage', (data) => this.onFormattedMessage(data));

    }



    bindOnBookTicker(callback: any) {
        this.onBookTicker = callback;
    }


    initSubscriptions() {
        this.wsClient.subscribeAllBookTickers('spot')
        
        this.wsClient.subscribeAllBookTickers('usdm')
    }

    async getAllSymbols(type: EType): Promise<string[]> {
        
        let result:ExchangeInfo | FuturesExchangeInfo;

        if (type === EType.SPOT) {
            result = await this.spotClient.getExchangeInfo();
        } else if (type === EType.VADELI) {
            result = await this.usdmClient.getExchangeInfo();
        }
        return result.symbols.map((symbol) => symbol.symbol);

    }

    async getPriceForSymbol(symbol: string, type: EType): Promise<number> {
        
        let result: SymbolPrice;
        if (type === EType.SPOT) {
            result = (await this.spotClient.getSymbolPriceTicker({ symbol: symbol })) as SymbolPrice;
        } else if (type === EType.VADELI) {
            result = (await this.usdmClient.getSymbolPriceTicker({ symbol: symbol })) as SymbolPrice;            
        }

        return parseFloat((result as SymbolPrice).price.toString());
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


