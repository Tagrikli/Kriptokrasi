import logger from "../Logger/logger";
import { WebSocketServer } from "ws";
import DatabaseManager from "../Database/database";
import { EStatus, TOrder, ECompare, EType, EPosition } from "../kriptokrasi-common/order_types";
import { UpdateManager, ActivationProcess, ReactUpdater } from "./managers";
import TelegramBot from "../TelegramBot/telegram_bot";
import { TLastTPDB } from "../utils/types";
import BinanceManager from "../BinanceAPI/main";
import { profitCalculator } from "./helpers";
import Notifier from "../Notifier/notifier";


const activationProcess = new ActivationProcess();


class Brain {
    active_orders: TOrder[] = [];
    active_orders_symbol: string[] = []

    inactive_orders: TOrder[] = [];
    inactive_orders_symbol: string[] = []

    lastTPs: TLastTPDB[] = [];

    wsServer: WebSocketServer
    db: DatabaseManager
    telegram: TelegramBot
    binance: BinanceManager

    reactUpdater: ReactUpdater;
    updateManager: UpdateManager;
    notifier: Notifier;

    constructor(db: DatabaseManager, telegram: TelegramBot, binance: BinanceManager, notifier: Notifier) {
        this.db = db;
        this.telegram = telegram;
        this.binance = binance;
        this.notifier = notifier;

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

        this.lastTPs = await this.db.getAllTPS() as TLastTPDB[];

        this.updateManager.updateSymbols([...this.active_orders_symbol, ...this.inactive_orders_symbol]);

        logger.brain('Orders updated.');
    }


    async onBinanceBookTicker(data: any) {


        if (process.env.LIVE_PRICE !== 'y') {
            logger.brain(JSON.stringify(data, null, 4));
        }


        const symbol: string = data.symbol;
        const bid_price: number = data.bidPrice;

        const in_inactives = this.inactive_orders_symbol.includes(symbol)
        const in_actives = this.active_orders_symbol.includes(symbol)


        if (in_actives || in_inactives) {


            //Send updates to react client if it should be updated.
            this.updateManager.shouldUpdate(symbol) && this.reactUpdater.updateClients({ symbol: symbol, bid_price: bid_price });


            //If the data in the inactive symbols.
            if (in_inactives) {

                //list of orders should be activated.
                let orders: TOrder[] = this.gottaActivate(this.relevantInactives(symbol), bid_price);

                //For every order that should be activated.
                orders.forEach(async order => {

                    //If the orders activation is not in process (Since binance data coming too fast and writing to database takes some time.)
                    if (!activationProcess.inProcess(order.id)) {

                        //Add order to activation process in order to prevent duplicate process..
                        activationProcess.addProcess(order.id);

                        //Activate order and update orders data of the brain.
                        await this.db.activateOrders(order.id);
                        await this.updateOrders();

                        //Finally notify all vip users.
                        this.telegram.sendMessageToAll(true, true, await this.notifier.waitingOrderActivated(order));

                        //Remove the process since its not in inactive orders.
                        activationProcess.removeProcess(order.id);
                    }
                })
            }


            //If the data in the active symbols.
            if (in_actives) {


                let orders_sl: TOrder[] = this.gottaStopLoss(this.relevantActives(symbol), bid_price);

                orders_sl.forEach(async order => {

                    if (!activationProcess.inProcess(order.id)) {

                        activationProcess.addProcess(order.id);


                        const profit = (bid_price - order.buy_price) * (100 / order.buy_price) * order.leverage;
                        await this.db.cancelOrder(order.id, profit, bid_price);
                        await this.updateOrders()

                        let msg = await this.notifier.activeOrderStopped(order, profit);
                        await this.telegram.sendMessageToAll(true, true, msg);

                        activationProcess.removeProcess(order.id);
                    }
                })



                let orders_tp: { order: TOrder, lastTP: number }[] = this.gottaTP(this.relevantActives(symbol), bid_price);


                orders_tp.forEach(async pair => {

                    const order = pair.order;
                    const lastTP = pair.lastTP;


                    if (!activationProcess.inProcess(order.id)) {


                        activationProcess.addProcess(order.id);

                        let momentary_price = 0;
                        try {
                            momentary_price = await this.binance.getPriceForSymbol(order.symbol);
                        } catch (error) {
                            logger.error(error);
                        }
                        let tp_data = order.tp_data as number[]
                        let profits = profitCalculator(bid_price, [order.buy_price, tp_data[0], tp_data[1], tp_data[2], tp_data[3], tp_data[4]], order.leverage);

                        await this.db.updateTP(order.id, lastTP + 1);
                        await this.db.updateStopLoss(order.id);
                        await this.updateOrders()


                        let msg = await this.notifier.tpActivated(order, lastTP + 1, profits[lastTP + 1]);
                        await this.telegram.sendMessageToAll(true, true, msg);

                        activationProcess.removeProcess(order.id);
                    }
                })


            }
        }
    }


    relevantActives(symbol: string) {
        return this.active_orders.filter(order => order.symbol === symbol);
    }

    relevantInactives(symbol: string) {
        return this.inactive_orders.filter(order => order.symbol === symbol);
    }


    gottaActivate(orders: TOrder[], bid_price: number) {
        //Returns list of orders should be activated.
        return orders.filter(order => this.conditionWorker(bid_price, order.buy_price, order.buy_condition));
    }

    gottaStopLoss(orders: TOrder[], bid_price: number) {
        //Returns list of orders should be deactivated
        return orders.filter(order => this.conditionWorker(bid_price, order.stop_loss, order.sl_condition));
    }


    //i hope bid price is the momentary live price; Tugi: yes it is
    gottaTP(orders: TOrder[], bid_price: number): { order: TOrder, lastTP: number }[] {

        let result: { order: TOrder, lastTP: number }[] = [];

        orders.forEach(order => {

            //Reverse the tp array
            let tps_reversed = (order.tp_data as number[]).slice().reverse();
            let last_tp_index: number = -1;

            //Find the index of first tp that satisfies the tp_condition (in reverse order)
            for (const [index, tp] of tps_reversed.entries()) {
                if (this.conditionWorker(bid_price, tp, order.tp_condition)) {
                    last_tp_index = tps_reversed.length - index - 1;
                    break;
                }
            }


            //If any of the tps satisfied the condition.
            if (last_tp_index > -1) {

                //Find the current tp index
                const current_tp_index = this.lastTPs.find(lastTP => lastTP.id === order.id).lastTP;



                //Add order and the correct tp index value to the result.
                if (last_tp_index >= current_tp_index) {
                    result.push({ order: order, lastTP: last_tp_index });
                }
            }



        })

        return result;

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