import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { PATH } from '../utils/paths';
import { User } from 'telegraf/typings/core/types/typegram';
import QUERIES from './queries';
import { ROOT_PATH } from '..';
import logger from '../Logger/logger';
import { TOrder, EStatus, TOrder_Past } from '../kriptokrasi-common/types/order_types';


class DatabaseManager {
    db: Database | undefined;
    db_dir: string

    constructor() {
        this.db_dir = path.join(ROOT_PATH, PATH.DB_DIR, 'database.sqlite');
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
        //await this.db.run(QUERIES.CREATE_CODES_TABLE);
        //logger.database('Codes table created!');
        await this.db.run(QUERIES.CREATE_POSTS_TABLE);
        logger.database('Posts table created');
        await this.db.run(QUERIES.CREATE_ORDERS_TABLE);
        logger.database('Orders table created');
        await this.db.run(QUERIES.CREATE_PAST_TABLE);
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
                undefined,
                undefined,
                false]);
        logger.database('New user created');
    }


    async getOrders(type: EStatus) {


        if (type === EStatus.ACTIVE || type === EStatus.WAITING) {

            let orders: TOrder[] = []

            let _orders = (type === EStatus.WAITING) ?
                (await this.db.all(QUERIES.SELECT_WAITING_ORDERS)) :
                (await this.db.all(QUERIES.SELECT_ACTIVE_ORDERS))


            _orders.forEach(order => {
                let tp_data = order.tp_data.split(',');
                delete order.tp_data;
                let result = { ...order, tp_data: tp_data };
                orders.push(result);
            })

            return orders;


        } else if (type === EStatus.PAST) {


            let result = await this.db.all(QUERIES.SELECT_PAST_ORDERS) as TOrder_Past[];
            let orders: TOrder_Past[] = result.slice();
            return orders;

        }

        return [];

    }



    async deleteOrders(order_ids: number[]) {
        order_ids.forEach(async order_id => {
            await this.db.run(QUERIES.DELETE_ORDERS_BY_ID, order_id);
        })
    }

    async activateOrders(order_ids: number[]) {

        order_ids.forEach(async order_id => {
            await this.db.run(QUERIES.ACTIVATE_ORDER_BY_ID, order_id);
        })

    }

    async cancelOrder(order_id: number) {
        let order = await this.db.get(QUERIES.SELECT_ORDER_BY_ID, [order_id]);
        if (order[15] == 1) { // the order is active
            let momentaryPrice = 11; // get the anlik fiyat
            let profit = (momentaryPrice - order.buy_price) * (100 / order.buy_price);
            await this.db.run(QUERIES.INSERT_PAST_ORDER, [
                order.id,
                order.symbol,
                Date.now().toString(), //timestamp
                order.position,
                order.type,
                order.leverage,
                order.buy_price,
                profit,
                momentaryPrice,
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
        await this.db.run(QUERIES.DELETE_ORDERS_BY_ID, order_id);

    }

    async createOrder(order: TOrder) {

        let tp_orders = order.tp_data.join(',');

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
            tp_orders,
            order.status,
        ])
    }

    async isVIP(user_id: number) {
        let _user = await this.db.get(QUERIES.SELECT_USER_BY_ID, [user_id]);
        let deadline = _user.code_timeout;
        let timeout = (deadline && deadline > Date.now());
        let approved = _user.vip;
        return { timeout: timeout, vip: approved };
    }

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


    async getAllVipUsers(filter: boolean) {
        let users: any[] = await this.db.all(QUERIES.SELECT_USER_BY_VIP);

        if (filter) {
            users = users.filter(user => {
                let deadline = user.code_timeout;
                return deadline && deadline > Date.now();
            });
        }

        return users;
    }

    isLimitExceeded(user_id: Number, limit: Number): Promise<Boolean> { // send_db_messages_file seyini sildim
        return new Promise((resolve, reject) => {
            this.db.get("SELECT COUNT(*) FROM posts WHERE user_id=? and (created_ts BETWEEN datetime('now', '-1 days') AND datetime('now', 'localtime'));",
                [user_id], (err, row) => {
                    if (err) resolve(false)
                    else {
                        if (row[0] >= limit) resolve(true); else resolve(false);
                    }
                })
        })
    }

}


export default DatabaseManager