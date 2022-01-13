import { WebSocket, WebSocketServer } from "ws";
import { dbManager } from "../Database/database";
import { TAddOrder_Norm } from "../kriptokrasi-common/types";
import { logger } from "../Logger/logger";


class Brain {
    active_orders: TAddOrder_Norm[] = [];
    active_orders_symbol: string[] = []

    inactive_orders: TAddOrder_Norm[] = [];
    inactive_orders_symbol: string[] = []


    wsServer: WebSocketServer


    constructor() {


    }

    bindWebsocket(ws: WebSocketServer) {
        this.wsServer = ws;
    }


    async updateOrders() {
        this.active_orders = await dbManager.getActiveOrders();
        this.active_orders_symbol = this.active_orders.map(order => order.symbol);

        this.inactive_orders = await dbManager.getInactiveOrders();
        this.inactive_orders_symbol = this.inactive_orders.map(order => order.symbol);
    }


    onBinanceBookTicker(data: any) {


        const symbol = data.symbol;
        const bid_price = data.bidPrice;

        const in_actives = this.active_orders_symbol.includes(symbol);
        const in_inactives = this.inactive_orders_symbol.includes(symbol);


        //Send updates to client.
        if (this.wsServer && this.wsServer.clients.size && (in_actives || in_inactives) && Date.now() % 10 === 0) {

            let message = { symbol: symbol, bid_price: bid_price };
            this.wsServer.clients.forEach(client => client.send(JSON.stringify(message)));

        }

        //Check to activate && Activate
        if (in_inactives) {

            let order: TAddOrder_Norm;
            if (order = this.gottaActivate(symbol, bid_price)) {
                logger.debug('Order Activated');
                dbManager.activateOrders([order.id]);
                
            }

        }


        //Check to buy? && Buy?
        if (in_actives) {


        }


    }


    gottaActivate(symbol: string, bid_price: number) {
        return this.inactive_orders.find(order => (order.symbol === symbol && order.buy_price <= bid_price));
    }

    gottaBuy() {


    }




}

export const brain = new Brain();