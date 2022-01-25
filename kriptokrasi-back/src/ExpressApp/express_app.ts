import express, { Express } from "express";
import logger from "../Logger/logger";
import cors from 'cors';
import DatabaseManager from "../Database/database";
import { TOrder, EStatus } from '../kriptokrasi-common/order_types';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import Brain from "../Brain/main";
import BinanceManager from "../BinanceAPI/main";
import ENDPOINTS from "../kriptokrasi-common/endpoints";
import { TTMessage } from "../kriptokrasi-common/message_types";
import TelegramBot from "../TelegramBot/telegram_bot";
import Notifier from "../Notifier/notifier";


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

        this.app.get(ENDPOINTS.GET_SYMBOLS, async (req, res) => {

            try {
                const symbol_list = await this.binance.getAllSymbols();
                res.send(symbol_list);
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
                const orders_ = await this.db.getOrdersById(order_ids, type)
                await this.db.deleteOrders(order_ids, type);


                if (type === EStatus.WAITING)
                    this.telegram.sendMessageToAll(true, true, this.notifier.waitingOrderDeletion(orders_ as TOrder[]));
                //if (type === EStatus.ACTIVE)
                //this.telegram.sendMessageToAll(true, true, this.notifier.activeOrderDeletion(orders_ as TOrder[]));


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


