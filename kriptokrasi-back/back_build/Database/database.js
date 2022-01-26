"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const queries_1 = __importDefault(require("./queries"));
const logger_1 = __importDefault(require("../Logger/logger"));
const order_types_1 = require("../kriptokrasi-common/order_types");
function orderTpListify(order) {
    let tp_data = order.tp_data.split(',').map(tp => parseFloat(tp));
    delete order.tp_data;
    return { ...order, tp_data: tp_data };
}
function orderTpStringfy(order) {
    let tp_data = order.tp_data.join(',');
    delete order.tp_data;
    return { ...order, tp_data: tp_data };
}
class DatabaseManager {
    db;
    db_dir;
    constructor() {
        this.db_dir = path_1.default.join(__dirname, '..', '..', 'data', 'database.sqlite');
    }
    async init() {
        await this.open();
        await this.initTables();
    }
    async open() {
        this.db = await (0, sqlite_1.open)({
            filename: this.db_dir,
            driver: sqlite3_1.default.cached.Database
        });
        logger_1.default.database('Database opened');
    }
    async initTables() {
        await this.db.run(queries_1.default.CREATE_USERS_TABLE);
        logger_1.default.database('Users table created');
        await this.db.run(queries_1.default.CREATE_POSTS_TABLE);
        logger_1.default.database('Posts table created');
        await this.db.run(queries_1.default.CREATE_ORDERS_TABLE);
        logger_1.default.database('Orders table created');
        await this.db.run(queries_1.default.CREATE_PAST_TABLE);
        logger_1.default.database('Past orders table created');
        await this.db.run(queries_1.default.CREATE_TP_TABLE);
        logger_1.default.database('TP table created');
        await this.db.run(queries_1.default.CREATE_LOGIN_TABLE);
        logger_1.default.database('Login_data table created');
    }
    async getPassword(username) {
        return await this.db.get(queries_1.default.SELECT_PASSWORD_BY_USERNAME, [username]);
    }
    async userExists(user_id) {
        return (await this.db.get(queries_1.default.SELECT_USER_BY_ID, [user_id])) ? true : false;
    }
    async createUser(user) {
        await this.db.run(queries_1.default.INSERT_USER, [user.id,
            user.is_bot,
            user.first_name,
            user.last_name,
            user.username,
            0,
            false]);
        logger_1.default.database('New user created');
    }
    async deleteUser(user_id) {
        await this.db.run(queries_1.default.DELETE_USER, [user_id]);
        logger_1.default.database('User deleted');
    }
    async getOrdersById(order_ids, type) {
        //Cok efficient degil sanki digerleri cok efficientmis gibi.
        //6 satir koddan daha efficient ne olabilir teallam
        //Only for waiting and active
        let orders = await this.getAllOrders(type);
        let orders_ = [];
        if (type === order_types_1.EStatus.ACTIVE || type === order_types_1.EStatus.WAITING) {
            orders_ = orders.filter(order => order_ids.includes(order.id));
        }
        else {
            orders_ = orders.filter(order => order_ids.includes(order.id));
        }
        return orders_;
    }
    async getAllTPS() {
        return await this.db.all(queries_1.default.SELECT_ALL_TPS);
    }
    async getOrderById(order_id) {
        let order = await this.db.get(queries_1.default.SELECT_ORDER_BY_ID, [order_id]);
        return orderTpListify(order);
    }
    async getAllOrders(type) {
        if (type === order_types_1.EStatus.ACTIVE || type === order_types_1.EStatus.WAITING) {
            let orders;
            if (type === order_types_1.EStatus.ACTIVE)
                orders = await this.db.all(queries_1.default.SELECT_ACTIVE_ORDERS);
            else if (type === order_types_1.EStatus.WAITING)
                orders = await this.db.all(queries_1.default.SELECT_WAITING_ORDERS);
            orders = orders.map(order => orderTpListify(order));
            return orders;
        }
        else if (type === order_types_1.EStatus.PAST) {
            let orders = await this.db.all(queries_1.default.SELECT_PAST_ORDERS);
            return orders;
        }
        return [];
    }
    async deleteOrders(order_ids, type) {
        if (type === order_types_1.EStatus.ACTIVE || type === order_types_1.EStatus.WAITING) {
            order_ids.forEach(async (order_id) => {
                await this.db.run(queries_1.default.DELETE_ORDER_BY_ID, [order_id]);
            });
        }
        else {
            order_ids.forEach(async (order_id) => {
                await this.db.run(queries_1.default.DELETE_PAST_BY_ID, [order_id]);
                ;
            });
        }
    }
    async activateOrders(order_ids) {
        let order_ids_ = Array.isArray(order_ids) ? order_ids : [order_ids];
        order_ids_.forEach(async (order_id) => {
            await this.db.run(queries_1.default.ACTIVATE_ORDER_BY_ID, [order_id]);
            await this.db.run(queries_1.default.INSERT_TP, [order_id]);
        });
    }
    async cancelOrder(order_id, profit, momentary_price) {
        let order = await this.getOrderById(order_id);
        if (order.status == order_types_1.EStatus.ACTIVE) { // the order is active
            if ((order.position === order_types_1.EPosition.LONG) || (order.type === order_types_1.EType.SPOT))
                profit = -profit;
            await this.db.run(queries_1.default.INSERT_PAST_ORDER, [
                order.id,
                order.symbol,
                Date.now().toString(),
                order.position,
                order.type,
                order.leverage,
                order.buy_price,
                momentary_price,
                profit,
                order.status,
            ]);
        }
        else {
            await this.db.run(queries_1.default.INSERT_PAST_ORDER, [
                order.id,
                order.symbol,
                Date.now().toString(),
                order.position,
                order.type,
                order.leverage,
                order.buy_price,
                '-',
                '-',
                order.status,
            ]);
        }
        // delete the order from the orders table
        await this.db.run(queries_1.default.DELETE_ORDER_BY_ID, [order_id]);
        await this.db.run(queries_1.default.DELETE_TP, [order_id]);
    }
    async createOrder(order) {
        await this.db.run(queries_1.default.INSERT_WAITING_ORDER, [
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
        ]);
        logger_1.default.database('New order created.');
    }
    async isVIP(user_id) {
        let _user = await this.db.get(queries_1.default.SELECT_USER_BY_ID, user_id);
        let timeout = _user.vip_timeout > Date.now();
        let approved = _user.vip;
        return { timeout: timeout, vip: approved };
    }
    async getAllUsers(vip, filter) {
        let users;
        if (!vip) {
            users = await this.db.all(queries_1.default.SELECT_ALL_USERS);
        }
        else {
            users = await this.db.all(queries_1.default.SELECT_USER_BY_VIP);
            if (filter) {
                users = users.filter(user => {
                    let deadline = user.vip_timeout;
                    return deadline > Date.now();
                });
            }
        }
        return users;
    }
    async updateVIP(user_id, vip, timeout) {
        await this.db.run(queries_1.default.UPDATE_VIP, [vip, timeout, user_id]);
    }
    async updateTP(order_id, tp_index) {
        await this.db.run(queries_1.default.UPDATE_TP, [tp_index, order_id]);
    }
    //LOGICAL SEYLERI BRAINDE YAPMAMIZ LAZIM
    async updateStopLoss(order_id) {
        const order = await this.getOrderById(order_id);
        let tpTable = await this.db.get(queries_1.default.SELECT_TP_BY_ID, [order_id]);
        let lastTP = tpTable.lastTP;
        let stop_loss = order.stop_loss;
        if ((lastTP == 0) || (lastTP == 1)) {
            stop_loss = order.buy_price;
        }
        else {
            stop_loss = order.tp_data[lastTP - 2];
        }
        await this.db.run(queries_1.default.UPDATE_STOP_LOSS, [stop_loss, order_id]);
    }
}
exports.default = DatabaseManager;
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
