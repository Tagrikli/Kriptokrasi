import express from "express";
import { logger } from "../Logger/logger";
import config from "../utils/config";
import cors from 'cors';
import { dbManager } from "../Database/database";
import { TAddOrder_Norm } from '../kriptokrasi-common/types';
import { webhookCallback } from "../TelegramBot/telegram_bot";
import { WebSocket } from 'ws';
import http from 'http';


const app = express();
const server = http.createServer(app);
export const wsServer = new WebSocket.Server({ server })
import './ws_functions';

if (process.env.MODE === 'prod') {

    app.use(express.static('build'));
    app.get('/', (req, res) => {
        res.sendFile('index.html');
    })

} else {
    app.use(cors());
    app.get('/', (req, res) => {
        res.send('Developement mode in progress...');
    })
}

app.use(express.json());
app.use(express.text());



//======= WEBHOOK =======//


app.post('/tradingview_webhook', (req, res) => {



    if (req.is('text/plain')) {
        let message: string = req.body

        logger.debug(JSON.stringify(req.body));
        webhookCallback(message);
        res.sendStatus(200);
        return;
    }

    res.sendStatus(500);
})


//======= API =======//

app.post('/api/v1/create_order', (req, res) => {
    const order: TAddOrder_Norm = req.body;

    dbManager.createOrder(order).then(() => {
        res.sendStatus(200);
    }).catch(reason => {
        logger.error(reason);
    });

})


app.get('/api/v1/get_inactive_orders', (req, res) => {

    dbManager.getInactiveOrders().then(orders => {
        res.send(orders);
    }).catch(reason => {
        res.sendStatus(500);
        logger.error(reason);
    })


})

app.get('/api/v1/get_active_orders', (req, res) => {

    dbManager.getActiveOrders().then(orders => {
        res.send(orders);
    }).catch(reason => {
        res.sendStatus(500);
        logger.error(reason);
    })


})


app.post('/api/v1/delete_orders', (req, res) => {

    const orderIds = req.body;

    console.log(orderIds);

    dbManager.deleteOrders(orderIds).then(() => {
        res.sendStatus(200);
    }).catch(reason => {
        res.sendStatus(500);
        logger.error(reason);

    })

});


app.post('/api/v1/activate_orders', (req, res) => {


    const orderIds = req.body;

    dbManager.activateOrders(orderIds).then(() => {
        res.sendStatus(200);
    }).catch(reason => {
        res.sendStatus(500);
        logger.error(reason);
    })

});

app.post('/api/v1/delete_active_orders');
app.get('/api/v1/delete_history');

app.post('/api/v1/post_telegram_message')       //  req.body => message content

//===================//

server.listen(config.network.express_port, () => {
    logger.info(`Express server started at http://localhost:${config.network.express_port}`)
})