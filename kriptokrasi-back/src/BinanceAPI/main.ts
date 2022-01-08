import { MainClient, WebsocketClient } from 'binance';
import { logger } from '../Logger/logger';


const client = new MainClient()

const binance_ws = new WebsocketClient({});

binance_ws.on("message", (data) => {

    logger.debug(JSON.stringify(data, null, 2));

});


//binance_ws.subscribeMarkPrice("BTCUST","usdm")