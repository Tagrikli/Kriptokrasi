import express, { Express } from "express";
import logger from "../Logger/logger";
import cors from 'cors';
import DatabaseManager from "../Database/database";
import { TOrder } from '../kriptokrasi-common/types/order_types';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import Brain from "../Brain/main";
import BinanceManager from "../BinanceAPI/main";
import { EStatus } from "../kriptokrasi-common/types/order_types";


class ExpressApp {
    mode: string;
    port: number;
    db: DatabaseManager;
    brain: Brain;
    binance: BinanceManager

    app: Express;
    server: http.Server;
    wss: WebSocketServer;

    webhookCallback: (message: any) => void;

    constructor(port: number, db: DatabaseManager, brain: Brain, binance: BinanceManager) {
        this.port = port;
        this.db = db;
        this.brain = brain;
        this.binance = binance;
        this.mode = process.env.MODE;
    }

    initExpress() {

        this.app = express();


        if (this.mode === 'production') {

            this.app.use(express.static('build'));
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


        this.app.get('/api/v1/get_symbols', async (req, res) => {

            try {
                const symbol_list = await this.binance.getAllSymbols();
                res.send(symbol_list);
            } catch (reason) {
                res.sendStatus(500);
                logger.error(reason);
            }
        })

        this.app.post('/api/v1/create_order', (req, res) => {
            const order: TOrder = req.body;
            logger.express('New order!');
            this.db.createOrder(order).then(() => {
                this.brain.updateOrders();
                res.sendStatus(200);
            }).catch(reason => {
                logger.error(reason);
            });

        })


        this.app.get('/api/v1/get_waiting_orders', (req, res) => {

            this.db.getOrders(EStatus.WAITING).then(orders => {
                res.send(orders);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);
            })

        })

        this.app.get('/api/v1/get_active_orders', (req, res) => {

            this.db.getOrders(EStatus.ACTIVE).then(orders => {
                res.send(orders);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);
            })

        })

        this.app.get('/api/v1/get_past_orders', (req, res) => {

            this.db.getOrders(EStatus.PAST).then(orders => {
                res.send(orders);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);
            })

        })


        this.app.post('/api/v1/delete_orders', (req, res) => {

            const orderIds = req.body;

            console.log(orderIds);

            this.db.deleteOrders(orderIds).then(() => {
                this.brain.updateOrders();
                res.sendStatus(200);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);

            })

        });


        this.app.post('/api/v1/activate_orders', (req, res) => {


            const orderIds = req.body;

            this.db.activateOrders(orderIds).then(() => {
                this.brain.updateOrders();
                res.sendStatus(200);
            }).catch(reason => {
                res.sendStatus(500);
                logger.error(reason);
            })

        });

        this.app.post('/webhook', (req, res) => {


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


        this.app.post('/api/v1/delete_active_orders');
        this.app.get('/api/v1/delete_history');
        this.app.post('/api/v1/post_telegram_message')

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


