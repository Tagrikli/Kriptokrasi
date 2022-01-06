import express from "express";
import { logger } from "../Logger/logger";
import config from "../utils/config";
import { TAddOrderData } from "../utils/types";
import cors from 'cors';
import { dbManager } from "../Database/database";
import { TAddOrder_Norm } from '../kriptokrasi-common/types';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Selamlar'); //Buraya react sayfasi gelicek react sayfasi bitince...
})


//======= API =======//

app.post('/api/v1/create_waiting_order', (req, res) => {
    const waiting_order: TAddOrder_Norm = req.body;

    dbManager.createWaitingOrder(waiting_order);

    //add_order_data degiskenini kullanarak islem yapabilirsin...
    logger.info('New data recieved [AddOrderData]');
    logger.info(JSON.stringify(waiting_order, null, 4));
    res.sendStatus(200);
})

app.get('/api/v1/get_waiting_orders', (req, res) => {

    try {
        dbManager.getWaitingOrders().then(orders => {
            res.send(orders);
        })
    } catch {
        res.sendStatus(500);
        logger.error('Get Waiting Orders failed');
    }


})


app.get('/api/v1/delete_waiting_orders');       //  ?ids=12,23,34,45
app.get('/api/v1/save_waiting_orders');         //  ?ids=12,23,34,45
app.get('/api/v1/upload_waiting_orders');       //  ?ids=12,23,34,45

app.get('/api/v1/delete_active_orders');        //  ?ids=12,23,34,45
app.get('/api/v1/delete_history');        //  ?ids=12,23,34,45


app.post('/api/v1/post_telegram_message')       //  req.body => message content

//===================//

app.listen(config.data.network.express_port, () => {
    logger.info(`Express server started at http://localhost:${config.data.network.express_port}`)
})