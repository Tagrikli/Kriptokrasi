import { any } from 'async';
import { MainClient, WebsocketClient } from 'binance';
import { logger } from '../Logger/logger';
import { SYMBOLS, wsServer } from '../ExpressApp/express_app';

export const client = new MainClient();

const wsClient = new WebsocketClient({ beautify: true });


wsClient.on('formattedMessage', (data) => {


    let symbol = (data as any).symbol;
    let bid_price = (data as any).bidPrice;

    if (SYMBOLS.includes(symbol)) {
        let message = { symbol: symbol, bid_price: bid_price };
        wsServer.clients.forEach(client => client.send(JSON.stringify(message)));
    }

});



wsClient.subscribeAllBookTickers('spot')