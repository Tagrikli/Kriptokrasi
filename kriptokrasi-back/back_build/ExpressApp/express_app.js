"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("../Logger/logger"));
const cors_1 = __importDefault(require("cors"));
const order_types_1 = require("../kriptokrasi-common/order_types");
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const endpoints_1 = __importDefault(require("../kriptokrasi-common/endpoints"));
const helpers_1 = require("../Brain/helpers");
const LOGIN_DATA = {
    ayca: {
        username: "Ayca",
        password: "Haziran2021*"
    },
    king: {
        username: "King",
        password: "King123"
    },
    nilay: {
        username: "Nilay",
        password: "Nilay123"
    },
    tugrul: {
        username: "Tugrul",
        password: "123"
    }
};
class ExpressApp {
    mode;
    port;
    db;
    brain;
    binance;
    telegram;
    notifier;
    app;
    server;
    wss;
    devLivePrice;
    webhookCallback;
    constructor(port, db, brain, binance, telegram, notifier) {
        this.port = port;
        this.db = db;
        this.brain = brain;
        this.binance = binance;
        this.telegram = telegram;
        this.notifier = notifier;
        this.mode = process.env.MODE;
    }
    bindDevLivePrice(callback) {
        this.devLivePrice = callback;
    }
    initExpress() {
        this.app = (0, express_1.default)();
        if (this.mode === 'production') {
            this.app.use(express_1.default.static('react_build'));
            this.app.get('/', (req, res) => {
                res.sendFile('index.html');
            });
        }
        else if (this.mode === 'development') {
            this.app.use((0, cors_1.default)());
            this.app.get('/', (req, res) => {
                res.send('Developement mode in progress...');
            });
        }
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.text());
        this.app.get(endpoints_1.default.GET_ALL_USERS, async (req, res) => {
            let users = await this.db.getAllUsers(false);
            res.send(users);
        });
        this.app.post(endpoints_1.default.DELETE_USERS, async (req, res) => {
            const user_ids = req.body.user_ids;
            try {
                await Promise.all(user_ids.map(async (id) => {
                    await this.db.deleteUser(id);
                }));
                res.sendStatus(200);
            }
            catch (error) {
                res.sendStatus(500);
            }
        });
        this.app.post(endpoints_1.default.UPDATE_VIP, async (req, res) => {
            const user_ids = req.body.user_ids;
            const vip = req.body.vip;
            const extension = req.body.extension;
            try {
                if (!vip) {
                    await Promise.all(user_ids.map(async (id) => {
                        this.db.updateVIP(id, vip, 0);
                    }));
                }
                else {
                    await Promise.all(user_ids.map(async (id) => {
                        this.db.updateVIP(id, vip, Date.now() + extension);
                    }));
                }
                res.sendStatus(200);
            }
            catch (error) {
                logger_1.default.error(error);
                res.sendStatus(500);
            }
        });
        this.app.post(endpoints_1.default.LOGIN, async (req, res) => {
            let username = req.body.username;
            let password = req.body.password;
            let data = await this.db.getPassword(username);
            if (data && data.password === password) {
                res.sendStatus(200);
            }
            else {
                res.sendStatus(201);
            }
        });
        this.app.post(endpoints_1.default.UPDATE_VILLAGER_DAY, async (req, res) => {
            const villager_day = req.body.is_villager_day;
            const timeout = req.body.timeout;
            try {
                await this.db.updateVillagerDay(villager_day, timeout);
                res.sendStatus(200);
            }
            catch (reason) {
                res.sendStatus(500);
                logger_1.default.error(reason);
            }
        });
        this.app.get(endpoints_1.default.GET_VILLAGER_DAY, async (req, res) => {
            try {
                const villager = await this.db.getVillagerDay();
                res.send(villager);
            }
            catch (reason) {
                res.sendStatus(500);
                logger_1.default.error(reason);
            }
        });
        this.app.get(endpoints_1.default.GET_SYMBOLS, async (req, res) => {
            try {
                const spot_list = await this.binance.getAllSymbols(order_types_1.EType.SPOT);
                const usdm_list = await this.binance.getAllSymbols(order_types_1.EType.VADELI);
                console.log(spot_list.length);
                console.log(usdm_list.length);
                res.send({ 0: spot_list, 1: usdm_list });
            }
            catch (reason) {
                res.sendStatus(500);
                logger_1.default.error(reason);
            }
        });
        this.app.post(endpoints_1.default.CREATE_ORDER, async (req, res) => {
            const order = req.body;
            logger_1.default.express('New order!');
            try {
                await this.db.createOrder(order);
                this.telegram.sendMessageToAll(true, true, this.notifier.waitingOrderAdded(order));
                this.brain.updateOrders();
                res.sendStatus(200);
            }
            catch (reason) {
                logger_1.default.error(reason);
                res.sendStatus(500);
            }
            ;
        });
        this.app.get(endpoints_1.default.GET_WAITING_ORDERS, async (req, res) => {
            try {
                const orders = await this.db.getAllOrders(order_types_1.EStatus.WAITING);
                res.send(orders);
            }
            catch (reason) {
                res.sendStatus(500);
                logger_1.default.error(reason);
            }
        });
        this.app.get(endpoints_1.default.GET_ACTIVE_ORDERS, (req, res) => {
            this.db.getAllOrders(order_types_1.EStatus.ACTIVE).then(orders => {
                res.send(orders);
            }).catch(reason => {
                res.sendStatus(500);
                logger_1.default.error(reason);
            });
        });
        this.app.get(endpoints_1.default.GET_PAST_ORDERS, (req, res) => {
            this.db.getAllOrders(order_types_1.EStatus.PAST).then(orders => {
                res.send(orders);
            }).catch(reason => {
                res.sendStatus(500);
                logger_1.default.error(reason);
            });
        });
        this.app.post(endpoints_1.default.DELETE_ORDERS, async (req, res) => {
            const order_ids = req.body.selections;
            const type = req.body.type;
            try {
                const orders_ = await this.db.getOrdersById(order_ids, type);
                await this.db.deleteOrders(order_ids, type);
                if (type === order_types_1.EStatus.WAITING) {
                    this.telegram.sendMessageToAll(true, true, this.notifier.waitingOrderDeletion(orders_));
                }
                else if (type === order_types_1.EStatus.ACTIVE) {
                    let profits = {};
                    for (const order of orders_) {
                        const lastTP = await this.db.getTPByID(order.id);
                        let momentary_price = 0;
                        try {
                            momentary_price = await this.binance.getPriceForSymbol(order.symbol, order.type);
                        }
                        catch (error) {
                            logger_1.default.error(error);
                        }
                        profits[order.id] = (0, helpers_1.profitCalculatorAfterStop)(momentary_price, [order.buy_price, ...order.tp_data], order.leverage, lastTP);
                    }
                    logger_1.default.debug(JSON.stringify(profits, null, 4));
                    this.telegram.sendMessageToAll(true, true, this.notifier.activeOrderDeletion(orders_, profits));
                }
                this.brain.updateOrders();
                res.sendStatus(200);
            }
            catch (reason) {
                res.sendStatus(500);
                logger_1.default.error(reason);
            }
        });
        this.app.post(endpoints_1.default.ACTIVATE_ORDERS, (req, res) => {
            const orderIds = req.body;
            this.db.activateOrders(orderIds).then(() => {
                this.brain.updateOrders();
                res.sendStatus(200);
            }).catch(reason => {
                res.sendStatus(500);
                logger_1.default.error(reason);
            });
        });
        this.app.post(endpoints_1.default.SEND_TELEGRAM_MESSAGE, async (req, res) => {
            const data = req.body;
            try {
                this.telegram.sendMessageToAll(data.vip, data.filter, data.message);
                res.sendStatus(200);
            }
            catch (reason) {
                logger_1.default.error(reason);
                res.sendStatus(500);
            }
        });
        this.app.post(endpoints_1.default.WEBHOOK, (req, res) => {
            if (this.webhookCallback) {
                if (req.is('text/plain')) {
                    let message = req.body;
                    logger_1.default.express(JSON.stringify(req.body));
                    this.webhookCallback(message);
                    res.sendStatus(200);
                    return;
                }
            }
            else {
                logger_1.default.error('Webhook Callback not binded');
            }
            res.sendStatus(500);
        });
        //FOR TEST PURPOSES
        this.app.post(endpoints_1.default.DEV_LIVE_PRICE, (req, res) => {
            const data = req.body;
            this.devLivePrice && this.devLivePrice(data);
            res.sendStatus(200);
        });
    }
    initServer() {
        this.server = http_1.default.createServer(this.app);
    }
    initWebsocket() {
        this.wss = new ws_1.WebSocket.Server({ server: this.server });
        this.wss.on('connection', (ws) => {
            logger_1.default.express('New WebSocket connection');
        });
        this.brain.bindWebsocket(this.wss);
    }
    bindWebhookCallback(callback) {
        this.webhookCallback = callback;
    }
    start() {
        this.initExpress();
        this.initServer();
        this.initWebsocket();
        this.server.listen(this.port, () => {
            logger_1.default.express(`Express server started at http://localhost:${this.port}`);
        });
    }
}
exports.default = ExpressApp;
