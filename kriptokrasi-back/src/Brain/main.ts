import logger from "../Logger/logger";
import { WebSocketServer } from "ws";
import DatabaseManager from "../Database/database";
import { EStatus, TOrder, ECompare } from "../kriptokrasi-common/order_types";
import Notifications from "../Notifier/notifier_functions";
import { UpdateManager, ActivationProcess, ReactUpdater } from "./managers";
import TelegramBot from "../TelegramBot/telegram_bot";


const activationProcess = new ActivationProcess();


class Brain {
    active_orders: TOrder[] = [];
    active_orders_symbol: string[] = []

    inactive_orders: TOrder[] = [];
    inactive_orders_symbol: string[] = []
    wsServer: WebSocketServer
    db: DatabaseManager
    telegram: TelegramBot

    reactUpdater: ReactUpdater;
    updateManager: UpdateManager;

    constructor(db: DatabaseManager, telegram: TelegramBot) {
        this.db = db;
        this.telegram = telegram;
        this.updateManager = new UpdateManager(1000);
    }

    bindWebsocket(ws: WebSocketServer) {
        this.wsServer = ws;
        this.reactUpdater = new ReactUpdater(ws);
    }


    async updateOrders() {
        this.active_orders = await this.db.getAllOrders(EStatus.ACTIVE) as TOrder[];
        this.active_orders_symbol = this.active_orders.map(order => order.symbol);

        this.inactive_orders = await this.db.getAllOrders(EStatus.WAITING) as TOrder[];
        this.inactive_orders_symbol = this.inactive_orders.map(order => order.symbol);

        this.updateManager.updateSymbols([...this.active_orders_symbol, ...this.inactive_orders_symbol]);

        logger.brain('Orders updated.');
    }


    async onBinanceBookTicker(data: any) {



        const symbol = data.symbol;
        const bid_price = data.bidPrice;

        const in_inactives = this.inactive_orders_symbol.includes(symbol)
        const in_actives = this.active_orders_symbol.includes(symbol)

        if (in_actives || in_inactives) {


            //Send updates to react client if it should be updated.
            this.updateManager.shouldUpdate(symbol) && this.reactUpdater.updateClients({ symbol: symbol, bid_price: bid_price });


            //If the data in the inactive symbols.
            if (in_inactives) {

                //list of orders should be activated.
                let orders: TOrder[] = this.gottaActivate(symbol, bid_price);

                //For every order that should be activated.
                orders.forEach(async order => {

                    //If the orders activation is not in process (Since binance data coming too fast and writing to database takes some time.)
                    if (!activationProcess.inProcess(order.id)) {

                        //Add order to activation process in order to prevent duplicate process..
                        activationProcess.addProcess(order.id);

                        //Activate order and update orders data of the brain.
                        await this.db.activateOrders(order.id);
                        await this.updateOrders();

                        //Remove the process since its not in inactive orders.
                        activationProcess.removeProcess(order.id);

                        //Finally notify all vip users.
                        this.telegram.sendMessageToAll(true, true, Notifications.waitingOrderActivation(order, bid_price));
                    }
                })
            }


            //If the data in the active symbols.
            if (in_actives) {








            }




        }


    }



    gottaActivate(symbol: string, bid_price: number) {
        //Returns list of orders should be activated.
        return this.inactive_orders.filter(order => (order.symbol === symbol && this.conditionWorker(bid_price, order.buy_price, order.buy_condition)));
    }

    gottaStopLoss(symbol: string, bid_price: number) {
        //Returns list of orders should be deactivated
        return this.active_orders.filter(order => (order.symbol === symbol && this.conditionWorker(bid_price, order.stop_loss, order.sl_condition)));
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