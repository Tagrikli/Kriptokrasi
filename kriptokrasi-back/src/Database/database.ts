import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { PATH } from '../utils/paths';
import { User } from 'telegraf/typings/core/types/typegram';
import QUERIES from './queries';
import { ROOT_PATH } from '..';
import logger from '../Logger/logger';
import { TOrder, EStatus, TOrder_Past } from '../kriptokrasi-common/order_types';
import { TLastTPDB, TUserDB } from '../utils/types';
import { Queries } from '../Query';


function orderTpListify(order: TOrder): Omit<TOrder, 'tp_data'> & { tp_data: number[] } {
    let tp_data = (order.tp_data as string).split(',').map(tp => parseFloat(tp));
    delete order.tp_data;
    return { ...order, tp_data: tp_data };
}

function orderTpStringfy(order: TOrder): Omit<TOrder, 'tp_data'> & { tp_data: string } {
    let tp_data = (order.tp_data as number[]).join(',');
    delete order.tp_data;
    return { ...order, tp_data: tp_data };
}



class DatabaseManager {
    db: Database | undefined;
    db_dir: string

    constructor() {
        this.db_dir = path.join(__dirname, 'data', 'database.sqlite');
    }


    async init() {
        await this.open();
        await this.initTables();
    }


    async open() {
        this.db = await open({
            filename: this.db_dir,
            driver: sqlite3.cached.Database
        });
        logger.database('Database opened')
    }


    async initTables() {
        await this.db.run(QUERIES.CREATE_USERS_TABLE);
        logger.database('Users table created');
        await this.db.run(QUERIES.CREATE_POSTS_TABLE);
        logger.database('Posts table created');
        await this.db.run(QUERIES.CREATE_ORDERS_TABLE);
        logger.database('Orders table created');
        await this.db.run(QUERIES.CREATE_PAST_TABLE);
        logger.database('Past orders table created');
        await this.db.run(QUERIES.CREATE_TP_TABLE);
        logger.database('Database tables created');
    }


    async userExists(user_id: number) {
        return (await this.db.get(QUERIES.SELECT_USER_BY_ID, [user_id])) ? true : false;
    }


    async createUser(user: User) {
        await this.db.run(QUERIES.INSERT_USER,
            [user.id,
            user.is_bot,
            user.first_name,
            user.last_name,
            user.username,
                0,
                false]);
        logger.database('New user created');
    }


    async getOrdersById(order_ids: number[], type: EStatus): Promise<TOrder[] | TOrder_Past[]> {
        //Cok efficient degil sanki digerleri cok efficientmis gibi.
        //Only for waiting and active

        let orders = await this.getAllOrders(type);
        let orders_: typeof orders = [];

        if (type === EStatus.ACTIVE || type === EStatus.WAITING) {
            orders_ = (orders as TOrder[]).filter(order => order_ids.includes(order.id));
        } else {
            orders_ = (orders as TOrder_Past[]).filter(order => order_ids.includes(order.id));
        }


        return orders_;
    }



    async getAllTPS(): Promise<TLastTPDB[]> {
        return await this.db.all(QUERIES.SELECT_ALL_TPS);
    }


    async getOrderById(order_id: number): Promise<TOrder> {
        let order = await this.db.get(QUERIES.SELECT_ORDER_BY_ID, [order_id]);
        return orderTpListify(order);
    }

    async getAllOrders(type: EStatus): Promise<TOrder[] | TOrder_Past[]> {
        if (type === EStatus.ACTIVE || type === EStatus.WAITING) {

            let orders: TOrder[]

            if (type === EStatus.ACTIVE)
                orders = await this.db.all(QUERIES.SELECT_ACTIVE_ORDERS);
            else if (type === EStatus.WAITING)
                orders = await this.db.all(QUERIES.SELECT_WAITING_ORDERS);



            orders = orders.map(order => orderTpListify(order));
            return orders;

        } else if (type === EStatus.PAST) {

            let orders: TOrder_Past[] = await this.db.all(QUERIES.SELECT_PAST_ORDERS)

            return orders;
        }

        return [];
    }


    async deleteOrders(order_ids: number[], type: EStatus) {

        if (type === EStatus.ACTIVE || type === EStatus.WAITING) {
            order_ids.forEach(async order_id => {
                await this.db.run(QUERIES.DELETE_ORDER_BY_ID, [order_id]);
            })
        } else {
            order_ids.forEach(async order_id => {
                await this.db.run(QUERIES.DELETE_PAST_BY_ID, [order_id]);;
            })
        }


    }

    async activateOrders(order_ids: number[] | number) {

        let order_ids_ = Array.isArray(order_ids) ? order_ids : [order_ids];

        order_ids_.forEach(async order_id => {
            await this.db.run(QUERIES.ACTIVATE_ORDER_BY_ID, [order_id]);
            await this.db.run(QUERIES.INSERT_TP, [order_id]);
        })

    }

    async cancelOrder(order_id: number, profit: number, momentary_price: number) {
        let order = await this.getOrderById(order_id);

        if (order.status == EStatus.ACTIVE) { // the order is active


            if (order.position == 1) profit = -profit;

            await this.db.run(QUERIES.INSERT_PAST_ORDER, [
                order.id,
                order.symbol,
                Date.now().toString(), //timestamp
                order.position,
                order.type,
                order.leverage,
                order.buy_price,
                momentary_price,
                profit,
                order.status,
            ])
        }
        else {
            await this.db.run(QUERIES.INSERT_PAST_ORDER, [
                order.id,
                order.symbol,
                Date.now().toString(), //timestamp
                order.position,
                order.type,
                order.leverage,
                order.buy_price,
                '-',
                '-',
                order.status,
            ])
        }
        // delete the order from the orders table
        await this.db.run(QUERIES.DELETE_ORDER_BY_ID, [order_id]);
        await this.db.run(QUERIES.DELETE_TP, [order_id]);

    }

    async createOrder(order: TOrder) {

        await this.db.run(QUERIES.INSERT_WAITING_ORDER, [
            order.id,
            order.symbol,
            order.position,
            order.type,
            order.leverage,
            order.buy_price,
            order.stop_loss,
            order.buy_condition,
            order.tp_condition,
            order.sl_condition,
            orderTpStringfy(order).tp_data,
            order.status,
        ])

        logger.database('New order created.');
    }

    async isVIP(user_id: number) {
        let _user: TUserDB = await this.db.get(QUERIES.SELECT_USER_BY_ID, user_id);
        let timeout = _user.vip_timeout > Date.now();
        let approved = _user.vip;
        return { timeout: timeout, vip: approved };
    }




    async getAllUsers(vip: boolean, filter?: boolean): Promise<TUserDB[]> {

        let users: TUserDB[];

        if (!vip) {

            users = await this.db.all(QUERIES.SELECT_ALL_USERS);

        } else {
            users = await this.db.all(QUERIES.SELECT_USER_BY_VIP);

            if (filter) {
                users = users.filter(user => {
                    let deadline = user.vip_timeout;
                    return deadline > Date.now();
                });
            }
        }

        return users;


    }


    async updateTP(order_id: number, tp_index: number) {
        await this.db.run(QUERIES.UPDATE_TP, [tp_index, order_id]);
    }


    //LOGICAL SEYLERI BRAINDE YAPMAMIZ LAZIM
    async updateStopLoss(order_id: number) {

        const order = await this.getOrderById(order_id);
        let tpTable = await this.db.get(QUERIES.SELECT_TP_BY_ID, [order_id]);
        let lastTP = tpTable.lastTP;
        let stop_loss = order.stop_loss

        if ((lastTP == 0) || (lastTP == 1)) {
            stop_loss= order.buy_price
        }
        else {
            stop_loss = order.tp_data[lastTP - 2] as number;
        }

        await this.db.run(QUERIES.UPDATE_STOP_LOSS, [stop_loss, order_id]);

    }


}


export default DatabaseManager

   // codeEntry(user_id: Number, code: String) { // kod bir sayi mi
    //     this.db.get('SELECT * FROM kodlar WHERE kod_id=?', [code], (err, row1) => {
    //         if (err) return TANIMSIZ_KOD_TEXT;
    //         else {
    //             const user_cur = this.db.get("SELECT * FROM users WHERE kod_id=?", [code], (err2, row2) => {
    //                 if (err2) return "User doesn't exist";
    //                 else {
    //                     if (row1[1] < Date.now()) return TARIHI_GECMIS_KOD_TEXT;
    //                     if (row2) return "Kod kullanımda."
    //                     else {
    //                         let code_end_day = row1[3].toInt();
    //                         this.db.run("UPDATE users SET code_id=?, code_timeout=?, code_day=? WHERE user_id =?", [row1[0], Date.now() + row1[3].toFloat() * 86400.0, code_end_day, user_id], () => {
    //                             return `${code_end_day} {KOD_ONAY_TEXT}`
    //                         });
    //                     }
    //                 }
    //             });
    //         }
    //     });
    // }

      // isLimitExceeded(user_id: Number, limit: Number): Promise<Boolean> { // send_db_messages_file seyini sildim
    //     return new Promise((resolve, reject) => {
    //         this.db.get("SELECT COUNT(*) FROM posts WHERE user_id=? and (created_ts BETWEEN datetime('now', '-1 days') AND datetime('now', 'localtime'));",
    //             [user_id], (err, row) => {
    //                 if (err) resolve(false)
    //                 else {
    //                     if (row[0] >= limit) resolve(true); else resolve(false);
    //                 }
    //             })
    //     })
    // }