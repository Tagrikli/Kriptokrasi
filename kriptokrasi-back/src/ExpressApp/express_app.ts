import express, { Express } from "express";
import logger from "../Logger/logger";
import cors from 'cors';
import DatabaseManager from "../Database/database";
import { TOrder, EStatus, EType, EPosition } from '../kriptokrasi-common/order_types';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import Brain from "../Brain/main";
import BinanceManager from "../BinanceAPI/main";
import ENDPOINTS from "../kriptokrasi-common/endpoints";
import { TTMessage } from "../kriptokrasi-common/message_types";
import TelegramBot from "../TelegramBot/telegram_bot";
import Notifier from "../Notifier/notifier";
import { profitCalculatorAfterStop } from "../Brain/helpers";


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

}


class ExpressApp {
    mode: string;
    port: number;
    db: DatabaseManager;
    brain: Brain;
    binance: BinanceManager
    telegram: TelegramBot
    notifier: Notifier

    app: Express;
    server: http.Server;
    wss: WebSocketServer;

    devLivePrice: (d: any) => void
    webhookCallback: (message: any) => void;

    constructor(port: number, db: DatabaseManager, brain: Brain, binance: BinanceManager, telegram: TelegramBot, notifier: Notifier) {
        this.port = port;
        this.db = db;
        this.brain = brain;
        this.binance = binance;
        this.telegram = telegram;
        this.notifier = notifier;
        this.mode = process.env.MODE;
    }


    bindDevLivePrice(callback: any) {
        this.devLivePrice = callback;
    }

    initExpress() {

        this.app = express();


        if (this.mode === 'production') {

            this.app.use(express.static('react_build'));
            this.app.get('/', (req, res) => {
                res.sendFile('index.html');
            })

        } else if (this.mode === 'development') {
            this.app.use(cors());
            this.app.get('/', (req, res) => {
                res.send('Developement mode in progress...');
            })
        }

        this.app.use(express.json());
        this.app.use(express.text());


        this.app.get(ENDPOINTS.GET_ALL_USERS, async (req, res) => {


            let users = await this.db.getAllUsers(false);
            res.send(users);


        })

        this.app.post(ENDPOINTS.DELETE_USERS, async (req, res) => {

            const user_ids: number[] = req.body.user_ids;
            try {
                await Promise.all(user_ids.map(async id => {

                    await this.db.deleteUser(id);

                }))
                res.sendStatus(200);

            } catch (error) {
                res.sendStatus(500);
            }
        })

        this.app.post(ENDPOINTS.UPDATE_VIP, async (req, res) => {

            const user_ids: number[] = req.body.user_ids;
            const vip: boolean = req.body.vip;
            const extension: number = req.body.extension;

            try {

                if (!vip) {

                    await Promise.all(user_ids.map(async id => {
                        this.db.updateVIP(id, vip, 0);
                    }))

                } else {

                    await Promise.all(user_ids.map(async id => {
                        this.db.updateVIP(id, vip, Date.now() + extension);
                    }))

                }


                res.sendStatus(200);

            } catch (error) {
                logger.error(error);
                res.sendStatus(500);
            }

        })


        this.app.post(ENDPOINTS.LOGIN, async (req, res) => {
            let username = req.body.username;
            let password = req.body.password;

            let data = await this.db.getPassword(username);

            if (data && data.password === password) {
                res.sendStatus(200);
            } else {
                res.sendStatus(201);
            }
        })

        this.app.post(ENDPOINTS.UPDATE_VILLAGER_DAY, async (req, res) => {

            const villager_day = req.body.is_villager_day;
            const timeout = req.body.timeout;

            try {
                await this.db.updateVillagerDay(villager_day, timeout);
                res.sendStatus(200);
            } catch (reason) {
                res.sendStatus(500);
                logger.error(reason);
            }

        })

        this.app.get(ENDPOINTS.GET_VILLAGER_DAY, async (req, res) => {

            try {

                const villager = await this.db.getVillagerDay();
                res.send(villager);

            } catch (reason) {
                res.sendStatus(500);
                logger.error(reason);

            }



        })

        this.app.get(ENDPOINTS.GET_SYMBOLS, async (req, res) => {

            try {
                const spot_list = await this.binance.getAllSymbols(EType.SPOT);
                const usdm_list = await this.binance.getAllSymbols(EType.VADELI);

                console.log(spot_list.length);
                console.log(usdm_list.length);


                res.send({ 0: spot_list, 1: usdm_list });
            } catch (reason) {
                res.sendStatus(500);
                logger.error(reason);
            }
        })

        this.app.post(ENDPOINTS.CREATE_ORDER, async (req, res) => {
            const order: TOrder = req.body;
            logger.express('New order!');

            try {
                await this.db.createOrder(order);
                let msg = await this.notifier.waitingOrderActivated(order);
                await this.telegram.sendMessageToAll(true, true, msg);
                this.brain.updateOrders();
                res.sendStatus(200);
            } catch (reason) {
                logger.error(reason);
                res.sendStatus(500);
            };

        })


        this.app.get(ENDPOINTS.GET_WAITING_ORDERS, async (req, res) => {

            try {

                const orders = await this.db.getAllOrders(EStatus.WAITING)
                res.send(orders);

            } catch (reason) {
                res.sendStatus(500);
                logger.error(reason);
            }

        })

        this.app.get(ENDPOINTS.GET_ACTIVE_ORDERS, (req, res) => {

            this.db.getAllOrders(EStatus.ACTIVE).then(orders => {
                res.send(orders);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);
            })

        })

        this.app.get(ENDPOINTS.GET_PAST_ORDERS, (req, res) => {

            this.db.getAllOrders(EStatus.PAST).then(orders => {
                res.send(orders);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);
            })

        })


        this.app.post(ENDPOINTS.DELETE_ORDERS, async (req, res) => {

            const order_ids: number[] = req.body.selections;
            const type: EStatus = req.body.type;

            try {
                const orders_ = await this.db.getOrdersById(order_ids, type) as TOrder[];
                await this.db.deleteOrders(order_ids, type);


                if (type === EStatus.WAITING) {
                    this.telegram.sendMessageToAll(true, true, this.notifier.waitingOrderDeletion(orders_ as TOrder[]));
                } else if (type === EStatus.ACTIVE) {

                    let profits = []

                    for (const order of orders_) {

                        const lastTP = await this.db.getTPByID(order.id)


                        let momentary_price = 0;
                        try {
                            momentary_price = await this.binance.getPriceForSymbol(order.symbol, order.type);
                        } catch (error) {
                            logger.error(error);
                        }



                        profits[order.id] = profitCalculatorAfterStop(momentary_price, [order.buy_price, ...(order.tp_data as number[])], order.leverage, lastTP)
                        if ((order.position === EPosition.SHORT)) profits = profits.map(tp => -tp);

                    }

                    logger.debug(JSON.stringify(profits, null, 4));

                    this.telegram.sendMessageToAll(true, true, this.notifier.activeOrderDeletion(orders_ as TOrder[], profits));

                }

                this.brain.updateOrders();
                res.sendStatus(200);
            } catch (reason) {
                res.sendStatus(500);
                logger.error(reason);
            }

        });


        this.app.post(ENDPOINTS.ACTIVATE_ORDERS, (req, res) => {


            const orderIds = req.body;

            this.db.activateOrders(orderIds).then(() => {
                this.brain.updateOrders();
                res.sendStatus(200);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);
            })

        });

        this.app.post(ENDPOINTS.SEND_TELEGRAM_MESSAGE, async (req, res) => {

            const data: TTMessage = req.body;


            try {

                this.telegram.sendMessageToAll(data.vip, data.filter, data.message);
                res.sendStatus(200);

            } catch (reason) {

                logger.error(reason);
                res.sendStatus(500);
            }


        })

        this.app.post(ENDPOINTS.WEBHOOK, (req, res) => {


            if (this.webhookCallback) {
                if (req.is('text/plain')) {
                    let message: string = req.body

                    logger.express(JSON.stringify(req.body));
                    this.webhookCallback(message);
                    res.sendStatus(200);
                    return;
                }

            } else {
                logger.error('Webhook Callback not binded');
            }

            res.sendStatus(500);

        })


        //FOR TEST PURPOSES
        this.app.post(ENDPOINTS.DEV_LIVE_PRICE, (req, res) => {

            const data: { symbol: string, bidPrice: number } = req.body;
            this.devLivePrice && this.devLivePrice(data);

            res.sendStatus(200);
        })


    }

    initServer() {
        this.server = http.createServer(this.app);
    }

    initWebsocket() {

        this.wss = new WebSocket.Server({ server: this.server });
        this.wss.on('connection', (ws) => {
            logger.express('New WebSocket connection');
        })

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
            logger.express(`Express server started at http://localhost:${this.port}`)
        })

    }

}



export default ExpressApp;


