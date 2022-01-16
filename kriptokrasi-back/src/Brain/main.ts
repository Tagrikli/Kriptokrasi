import { WebSocketServer } from "ws";
import DatabaseManager from "../Database/database";
import { EStatus, TOrder } from "../kriptokrasi-common/types/order_types";
import logger from "../Logger/logger";
import { ECompare } from "../utils/types";


class Brain {
    active_orders: TOrder[] = [];
    active_orders_symbol: string[] = []

    inactive_orders: TOrder[] = [];
    inactive_orders_symbol: string[] = []

    wsServer: WebSocketServer

    db: DatabaseManager

    constructor(db: DatabaseManager) {
        this.db = db;

    }

    bindWebsocket(ws: WebSocketServer) {
        this.wsServer = ws;
    }


    async updateOrders() {
        this.active_orders = await this.db.getOrders(EStatus.ACTIVE) as TOrder[];
        this.active_orders_symbol = this.active_orders.map(order => order.symbol);

        this.inactive_orders = await this.db.getOrders(EStatus.WAITING) as TOrder[];
        this.inactive_orders_symbol = this.inactive_orders.map(order => order.symbol);
    }


    onBinanceBookTicker(data: any) {


        logger.brain(JSON.stringify(data));

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

            let order: TOrder;
            if (order = this.gottaActivate(symbol, bid_price)) {
                logger.brain('Order Activated');
                this.db.activateOrders([order.id]);

            }

        }


        //Check to buy? && Buy?
        if (in_actives) {


        }


    }



    gottaActivate(symbol: string, bid_price: number) {
        return this.inactive_orders.find(order => (order.symbol === symbol && this.conditionWorker(bid_price, order.buy_price, order.buy_condition)));
    }

    gottaStopLoss(symbol: string, bid_price: number) {
        return this.active_orders.find(order => (order.symbol === symbol && this.conditionWorker(bid_price, order.stop_loss, order.sl_condition)));
    }

    gottaBuy() {


    }

    conditionWorker(livePrice, orderPrice, condition) {
        if (condition == ECompare.GT) return (livePrice > orderPrice);
        else if (condition == ECompare.EQ) return (livePrice == orderPrice);
        else if (condition == ECompare.LT) return (livePrice < orderPrice);
    }


}

export default Brain;