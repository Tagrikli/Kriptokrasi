import logger from "../Logger/logger";
import { WebSocketServer } from "ws";
import DatabaseManager from "../Database/database";
import { EStatus, TOrder, ECompare } from "../kriptokrasi-common/order_types";

import UpdateManager from "./update_manager";


class Brain {
    active_orders: TOrder[] = [];
    active_orders_symbol: string[] = []

    inactive_orders: TOrder[] = [];
    inactive_orders_symbol: string[] = []
    wsServer: WebSocketServer
    db: DatabaseManager

    updateManager: UpdateManager;


    constructor(db: DatabaseManager) {
        this.db = db;
        this.updateManager = new UpdateManager(1000);
    }

    bindWebsocket(ws: WebSocketServer) {
        this.wsServer = ws;
    }


    async updateOrders() {
        this.active_orders = await this.db.getOrders(EStatus.ACTIVE) as TOrder[];
        this.active_orders_symbol = this.active_orders.map(order => order.symbol);

        this.inactive_orders = await this.db.getOrders(EStatus.WAITING) as TOrder[];
        this.inactive_orders_symbol = this.inactive_orders.map(order => order.symbol);

        this.updateManager.updateSymbols([...this.active_orders_symbol, ...this.inactive_orders_symbol]);

        logger.brain('Orders updated.');
    }


    onBinanceBookTicker(data: any) {

        const symbol = data.symbol;
        const bid_price = data.bidPrice;

        const in_actives = this.active_orders_symbol.includes(symbol);
        const in_inactives = this.inactive_orders_symbol.includes(symbol);


        //Send updates to client. 
        if (this.wsServer && this.wsServer.clients.size && (in_actives || in_inactives) && this.updateManager.shouldUpdate(symbol)) {

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

    conditionWorker(live_price: number, order_price: number, condition: ECompare) {
        switch (condition) {
            case ECompare.GT:
                return live_price > order_price;
            case ECompare.LT:
                return live_price < order_price;
            case ECompare.GTE:
                return live_price >= order_price;
            case ECompare.LTE:
                return live_price <= order_price;
            case ECompare.EQ:
                return live_price == order_price;
        }
    }


}

export default Brain;