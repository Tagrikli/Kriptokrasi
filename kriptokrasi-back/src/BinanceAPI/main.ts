import { MainClient, WebsocketClient } from 'binance';
import { logger } from '../Logger/logger';


const client = new MainClient()

const wsClient = new WebsocketClient({});

wsClient.on("message", (data) => {

    logger.debug(JSON.stringify(data, null, 2));

});


wsClient.subscribeMarkPrice("BTCUST","usdm")