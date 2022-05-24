import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { PATH } from '../utils/paths';
import { User } from 'telegraf/typings/core/types/typegram';
import QUERIES from './queries';
import { ROOT_PATH } from '..';
import logger from '../Logger/logger';
import { TOrder, EStatus, TOrder_Past, EPosition, EType } from '../kriptokrasi-common/order_types';
import { TLastTPDB } from '../utils/types';
import { TUserDB } from '../kriptokrasi-common/order_types';
import { Queries } from '../Query';
import { time } from 'console';
import { each } from 'async';


function orderTpListify(order: TOrder): Omit<TOrder, 'tp_data'> & { tp_data: number[] } {
    let temp = JSON.parse(JSON.stringify(order));
    let tp_data = (temp.tp_data as string).split(',').map(tp => parseFloat(tp));
    delete temp.tp_data;
    return { ...temp, tp_data: tp_data };
}

function orderTpStringfy(order: TOrder): Omit<TOrder, 'tp_data'> & { tp_data: string } {
    let temp = JSON.parse(JSON.stringify(order));
    let tp_data = (temp.tp_data as number[]).join(',');
    delete temp.tp_data;
    return { ...temp, tp_data: tp_data };
}



class DatabaseManager {
    db: Database | undefined;
    db_dir: string

    constructor() {
        this.db_dir = path.join(__dirname, '..', '..', 'data', 'database.sqlite');
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
        logger.database('TP table created');
        await this.db.run(QUERIES.CREATE_LOGIN_TABLE)
        logger.database('Login_data table created');
        await this.db.run(QUERIES.CREATE_VILLAGERDAY_TABLE);
        this.createVillagerDay();
        logger.database('Villager_day table created');
    }

    async createVillagerDay() {
        try{
            const villager = await this.db.all(QUERIES.SELECT_VILLAGER_DAY);
            if (!villager.length) {
                await this.db.run(QUERIES.INSERT_DAY)
            }
        }catch(error){
            logger.error(error);
        }
    }

    async getPassword(username: string) {
        try{
            return await this.db.get(QUERIES.SELECT_PASSWORD_BY_USERNAME, [username])
        }catch(error){
            logger.error(error);
        }
    }


    async userExists(user_id: number) {
        try{
            return (await this.db.get(QUERIES.SELECT_USER_BY_ID, [user_id])) ? true : false;
        }catch(error){
            logger.error(error);
        }
    }


    async createUser(user: User) {
        try{
            await this.db.run(QUERIES.INSERT_USER,
                [user.id,
                user.is_bot,
                user.first_name,
                user.last_name,
                user.username,
                    0,
                    false,
                    "tr"]);
            logger.database('New user created');
        }catch(error){
            logger.error(error);
        }
    }

    async deleteUser(user_id: number) {

        await this.db.run(QUERIES.DELETE_USER, [user_id]);
        logger.database('User deleted');

    }


    async getOrdersById(order_ids: number[], type: EStatus): Promise<TOrder[] | TOrder_Past[]> {
        //Cok efficient degil sanki digerleri cok efficientmis gibi.
        //6 satir koddan daha efficient ne olabilir teallam
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

    async cancelOrder(order_id: number, profit: number, momentary_price: number, cancel: number) {
        let order = await this.getOrderById(order_id);

        if (order.status == EStatus.ACTIVE) { // the order is active

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
                cancel,
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
                cancel,
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

    async getTPByID(order_id: number) {
        let TPtable = await this.db.get(QUERIES.SELECT_TP_BY_ID, [order_id]);
        return TPtable.lastTP;
    }

    async isVillagerDay() {
        let villagerDay = await this.db.get(QUERIES.SELECT_VILLAGER_DAY);
        return villagerDay.is_villager_day && (villagerDay.timeout > Date.now());
    }

    async getVillagerDay() {
        return await this.db.get(QUERIES.SELECT_VILLAGER_DAY);
    }

    async getAllUsers(vip: boolean, filter?: boolean): Promise<TUserDB[]> {

        let users: TUserDB[];

        if ((!vip) || (await this.isVillagerDay())) {
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


    async updateVIP(user_id: number, vip: boolean, timeout: number) {
        await this.db.run(QUERIES.UPDATE_VIP, [vip, timeout, user_id]);
    }


    async updateTP(order_id: number, tp_index: number) {
        await this.db.run(QUERIES.UPDATE_TP, [tp_index, order_id]);
    }

    async updateVillagerDay(villager_day: boolean, timeout: number) {
        await this.db.run(QUERIES.UPDATE_VILLAGER_DAY, [villager_day, Date.now() + timeout]);
        return "tugrulun fikriydi hadi hayirlisi"
    }

    async getUserLangPref() {
        
        let data = {};
        let users = await this.db.all(QUERIES.SELECT_ALL_USERS);
        users.forEach(user => {
            data[user.user_id] = user.lang;
        });

        return data;
    }

    //LOGICAL SEYLERI BRAINDE YAPMAMIZ LAZIM
    async updateStopLoss(order_id: number) {

        const order = await this.getOrderById(order_id);
        let tpTable = await this.db.get(QUERIES.SELECT_TP_BY_ID, [order_id]);
        let lastTP = tpTable.lastTP;
        let stop_loss = order.stop_loss

        if ((lastTP == 0) || (lastTP == 1)) {
            stop_loss = order.buy_price
        }
        else {
            stop_loss = order.tp_data[lastTP - 2] as number;
        }
        await this.db.run(QUERIES.UPDATE_STOP_LOSS, [stop_loss, order_id]);
    }
}


export default DatabaseManager
