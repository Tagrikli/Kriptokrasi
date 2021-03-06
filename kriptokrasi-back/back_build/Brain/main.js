"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../Logger/logger"));
const order_types_1 = require("../kriptokrasi-common/order_types");
const managers_1 = require("./managers");
const helpers_1 = require("./helpers");
const activationProcess = new managers_1.ActivationProcess();
class Brain {
    active_orders = [];
    active_orders_symbol = [];
    inactive_orders = [];
    inactive_orders_symbol = [];
    lastTPs = [];
    wsServer;
    db;
    telegram;
    binance;
    reactUpdater;
    updateManager;
    notifier;
    constructor(db, telegram, binance, notifier) {
        this.db = db;
        this.telegram = telegram;
        this.binance = binance;
        this.notifier = notifier;
        this.updateManager = new managers_1.UpdateManager(500);
    }
    bindWebsocket(ws) {
        this.wsServer = ws;
        this.reactUpdater = new managers_1.ReactUpdater(ws);
    }
    async updateOrders() {
        this.active_orders = await this.db.getAllOrders(order_types_1.EStatus.ACTIVE);
        this.active_orders_symbol = this.active_orders.map(order => order.symbol);
        this.inactive_orders = await this.db.getAllOrders(order_types_1.EStatus.WAITING);
        this.inactive_orders_symbol = this.inactive_orders.map(order => order.symbol);
        this.lastTPs = await this.db.getAllTPS();
        this.updateManager.updateSymbols([...this.active_orders_symbol, ...this.inactive_orders_symbol]);
        logger_1.default.brain('Orders updated.');
    }
    async onTelegramAppMessage(event) {
        const message = event.message.message;
        this.telegram.sendMessageToAll(true, true, message, 'TR');
        this.telegram.sendMessageToAll(true, true, message, 'EN');
    }
    async onBinanceBookTicker(data) {
        if (process.env.LIVE_PRICE !== 'y') {
            logger_1.default.brain(JSON.stringify(data, null, 4));
        }
        const symbol = data.symbol;
        const bid_price = data.bidPrice;
        const type = data.wsMarket === 'spot' ? order_types_1.EType.SPOT : order_types_1.EType.VADELI;
        const in_inactives = this.inactive_orders_symbol.includes(symbol);
        const in_actives = this.active_orders_symbol.includes(symbol);
        if (in_actives || in_inactives) {
            //Send updates to react client if it should be updated.
            this.updateManager.shouldUpdate(symbol) && this.reactUpdater.updateClients({ symbol: symbol, bid_price: bid_price, type: type });
            //If the data in the inactive symbols.
            if (in_inactives) {
                //list of orders should be activated.
                let orders = this.gottaActivate(this.relevantInactives(symbol, type), bid_price);
                //For every order that should be activated.
                orders.forEach(async (order) => {
                    //If the orders activation is not in process (Since binance data coming too fast and writing to database takes some time.)
                    if (!activationProcess.inProcess(order.id)) {
                        //Add order to activation process in order to prevent duplicate process..
                        activationProcess.addProcess(order.id);
                        //Activate order and update orders data of the brain.
                        await this.db.activateOrders(order.id);
                        await this.updateOrders();
                        //Finally notify all vip users.
                        this.telegram.sendMessageToAll(true, true, await this.notifier.waitingOrderActivatedTR(order), 'TR');
                        this.telegram.sendMessageToAll(true, true, await this.notifier.waitingOrderActivatedEN(order), 'EN');
                        //Remove the process since its not in inactive orders.
                        activationProcess.removeProcess(order.id);
                    }
                });
            }
            //If the data in the active symbols.
            if (in_actives) {
                let orders_sl = this.gottaStopLoss(this.relevantActives(symbol, type), bid_price);
                orders_sl.forEach(async (order) => {
                    if (!activationProcess.inProcess(order.id)) {
                        activationProcess.addProcess(order.id);
                        const lastTP = await this.db.getTPByID(order.id);
                        let profits = (0, helpers_1.profitCalculator)(bid_price, [order.buy_price, ...order.tp_data], order.leverage, lastTP);
                        if ((order.position === order_types_1.EPosition.SHORT))
                            profits = profits.map(tp => -tp);
                        console.log("stoploss tps", profits);
                        await this.db.cancelOrder(order.id, profits[lastTP + 1], bid_price, 0);
                        await this.updateOrders();
                        let msg = await this.notifier.activeOrderStoppedTR(order, profits[lastTP + 1], lastTP, bid_price);
                        await this.telegram.sendMessageToAll(true, true, msg, 'TR');
                        let msg2 = await this.notifier.activeOrderStoppedEN(order, profits[lastTP + 1], lastTP, bid_price);
                        await this.telegram.sendMessageToAll(true, true, msg2, 'EN');
                        activationProcess.removeProcess(order.id);
                    }
                });
                let orders_tp = this.gottaTP(this.relevantActives(symbol, type), bid_price);
                orders_tp.forEach(async (pair) => {
                    const order = pair.order;
                    const lastTP = pair.lastTP;
                    if (!activationProcess.inProcess(order.id)) {
                        activationProcess.addProcess(order.id);
                        let momentary_price = 0;
                        try {
                            momentary_price = await this.binance.getPriceForSymbol(order.symbol, order.type);
                        }
                        catch (error) {
                            logger_1.default.error(error);
                        }
                        let profits = await (0, helpers_1.profitCalculator)(bid_price, [order.buy_price, ...order.tp_data], order.leverage, lastTP);
                        if ((order.position === order_types_1.EPosition.SHORT))
                            profits = profits.map(tp => -tp);
                        let msg = await this.notifier.tpActivatedTR(order, lastTP + 1, profits[lastTP + 1]);
                        await this.telegram.sendMessageToAll(true, true, msg, 'TR');
                        let msg2 = await this.notifier.tpActivatedEN(order, lastTP + 1, profits[lastTP + 1]);
                        await this.telegram.sendMessageToAll(true, true, msg2, 'EN');
                        await this.db.updateTP(order.id, lastTP);
                        await this.db.updateStopLoss(order.id);
                        await this.updateOrders();
                        activationProcess.removeProcess(order.id);
                    }
                });
            }
        }
    }
    relevantActives(symbol, type) {
        return this.active_orders.filter(order => order.symbol === symbol && order.type === type);
    }
    relevantInactives(symbol, type) {
        return this.inactive_orders.filter(order => order.symbol === symbol && order.type === type);
    }
    gottaActivate(orders, bid_price) {
        //Returns list of orders should be activated.
        return orders.filter(order => Brain.conditionWorker(bid_price, order.buy_price, order.buy_condition));
    }
    gottaStopLoss(orders, bid_price) {
        //Returns list of orders should be deactivated
        return orders.filter(order => Brain.conditionWorker(bid_price, order.stop_loss, order.sl_condition));
    }
    //i hope bid price is the momentary live price; Tugi: yes it is
    gottaTP(orders, bid_price) {
        let result = [];
        orders.forEach(order => {
            //Reverse the tp array
            let tps_reversed = order.tp_data.slice().reverse();
            let last_tp_index = -1;
            //Find the index of first tp that satisfies the tp_condition (in reverse order)
            for (const [index, tp] of tps_reversed.entries()) {
                if (Brain.conditionWorker(bid_price, tp, order.tp_condition)) {
                    last_tp_index = tps_reversed.length - index - 1;
                    break;
                }
            }
            //If any of the tps satisfied the condition.
            if (last_tp_index > -1) {
                //Find the current tp index
                const current_tp_index = this.lastTPs.find(lastTP => lastTP.id === order.id).lastTP;
                //Add order and the correct tp index value to the result.
                if (last_tp_index > current_tp_index) {
                    result.push({ order: order, lastTP: last_tp_index });
                }
            }
        });
        return result;
    }
    static conditionWorker(live_price, order_price, condition) {
        switch (condition) {
            case order_types_1.ECompare.GT:
                return live_price > order_price;
            case order_types_1.ECompare.LT:
                return live_price < order_price;
            case order_types_1.ECompare.GTE:
                return live_price >= order_price;
            case order_types_1.ECompare.LTE:
                return live_price <= order_price;
            case order_types_1.ECompare.EQ:
                return live_price == order_price;
        }
    }
}
exports.default = Brain;
