import Database from 'sqlite-async';
import path from 'path';
import { PATH } from '../utils/paths';
import { User } from 'telegraf/typings/core/types/typegram';
import QUERIES from './query_parser';
import { TANIMSIZ_KOD_TEXT, TARIHI_GECMIS_KOD_TEXT } from '../utils/consts';
import { ROOT_PATH } from '..';
import { logger } from '../Logger/logger';
import { TAddOrder_Norm } from '../../kriptokrasi-ui/src/utils/data_types';



export default class DatabaseManager {
    db: Database | undefined;
    db_dir: string

    constructor() {
        this.db_dir = path.join(ROOT_PATH, PATH.DB_DIR, 'database.sqlite');
        this.open().then(() => this.initTables());
    }

    async open() {
        this.db = await Database.open(this.db_dir);
        logger.info('Database opened')
    }


    async initTables() {
        await this.db.run(QUERIES.CREATE_USERS_TABLE);
        await this.db.run(QUERIES.CREATE_CODES_TABLE);
        await this.db.run(QUERIES.CREATE_POSTS_TABLE);
        await this.db.run(QUERIES.CREATE_WAITING_ORDERS_TABLE)
        logger.debug('Database tables created');
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
        logger.info('New user created');
    }

    async getWaitingOrders() {
        return (await this.db.all(QUERIES.SELECT_WAITING_ORDERS));
    }

    async createWaitingOrder(order: TAddOrder_Norm) {
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
            order['take-profit-1'],
            order['take-profit-2'],
            order['take-profit-3'],
            order['take-profit-4'],
            order['take-profit-5'],
        ])
    }

    async isVIP(user_id: number) {
        let _user = await this.db.get(QUERIES.SELECT_USER_BY_ID, [user_id]);
        let deadline = _user.code_timeout;
        let timeout = (deadline && deadline > Date.now());
        let approved = _user.vip;
        return { timeout: timeout, vip: approved };
    }

    codeEntry(user_id: Number, code: String) { // kod bir sayi mi
        this.db.get('SELECT * FROM kodlar WHERE kod_id=?', [code], (err, row1) => {
            if (err) return TANIMSIZ_KOD_TEXT;
            else {
                const user_cur = this.db.get("SELECT * FROM users WHERE kod_id=?", [code], (err2, row2) => {
                    if (err2) return "User doesn't exist";
                    else {
                        if (row1[1] < Date.now()) return TARIHI_GECMIS_KOD_TEXT;
                        if (row2) return "Kod kullanımda."
                        else {
                            let code_end_day = row1[3].toInt();
                            this.db.run("UPDATE users SET code_id=?, code_timeout=?, code_day=? WHERE user_id =?", [row1[0], Date.now() + row1[3].toFloat() * 86400.0, code_end_day, user_id], () => {
                                return `${code_end_day} {KOD_ONAY_TEXT}`
                            });
                        }
                    }
                });
            }
        });
    }


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


export const dbManager = new DatabaseManager();