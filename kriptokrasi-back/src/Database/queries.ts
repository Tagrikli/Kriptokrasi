import { UpdateConnectionState } from "telegram/network";

const QUERIES = {

    //users

    CREATE_USERS_TABLE: /*sql*/`
        CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER NOT NULL,
        is_bot INTEGER,
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        vip_timeout INTEGER,
        vip INTEGER,
        PRIMARY KEY(user_id))`,

    SELECT_USER_BY_ID: /*sql*/`
        SELECT *
        FROM users
        WHERE user_id = ?`,

    SELECT_ALL_USERS: /*sql*/`
        SELECT *
        FROM users`,

    SELECT_USER_BY_VIP: /*sql*/`
        SELECT *
        FROM users
        WHERE vip = 1`,

    INSERT_USER: /*sql*/`
        INSERT OR IGNORE INTO users
        VALUES (?, ?, ?, ?, ?, ?, ?)`,

    UPDATE_VIP:/*sql*/`
        UPDATE users
        SET vip = ?, vip_timeout = ?
        WHERE user_id =? `,

    DELETE_USER: /*sql*/`
        DELETE FROM users
        WHERE user_id = ?`,

    //orders

    CREATE_ORDERS_TABLE: /*sql*/`
        CREATE TABLE IF NOT EXISTS orders (
        id INTEGER NOT NULL,
        symbol TEXT,
        position INTEGER,
        type INTEGER,
        leverage INTEGER,
        buy_price INTEGER,
        stop_loss INTEGER,
        buy_condition INTEGER,
        tp_condition INTEGER,
        sl_condition INTEGER,
        tp_data TEXT,
        status INTEGER,
        PRIMARY KEY(id AUTOINCREMENT))`,

    SELECT_ORDER_BY_ID: /*sql*/`
        SELECT *
        FROM orders
        WHERE id = ?`,

    SELECT_ACTIVE_ORDERS: /*sql*/`
        SELECT *
        FROM orders
        WHERE status = 1`,

    SELECT_WAITING_ORDERS: /*sql*/`
        SELECT *
        FROM orders
        WHERE status = 0`,

    INSERT_WAITING_ORDER: /*sql*/`
        INSERT INTO orders
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    ACTIVATE_ORDER_BY_ID: /*sql*/`
        UPDATE orders
        SET status = 1
        WHERE id = ?`,

    DELETE_ORDER_BY_ID: /*sql*/`
        DELETE FROM orders
        WHERE id = ?`,

    UPDATE_STOP_LOSS: /*sql*/`
        UPDATE orders
        SET stop_loss = ?
        WHERE id =?`,

    //past

    CREATE_PAST_TABLE: /*sql*/`
        CREATE TABLE IF NOT EXISTS past (
        id INTEGER NOT NULL,
        symbol TEXT,
        timestamp TEXT,
        position INTEGER,
        type INTEGER,
        leverage INTEGER,
        buy_price INTEGER,
        sell_price INTEGER,
        profit INTEGER,
        cancel INTEGER,
        PRIMARY KEY(id))`,

    SELECT_PAST_ORDERS: /*sql*/`
        SELECT *
        FROM past`,

    INSERT_PAST_ORDER: /*sql*/`
        INSERT INTO past
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    DELETE_PAST_BY_ID: /*sql*/`
        DELETE FROM past
        WHERE id =?`,

    //lastTPs

    CREATE_TP_TABLE: /*sql*/`
        CREATE TABLE IF NOT EXISTS lastTPS (
        id INTEGER NOT NULL,
        lastTP INTEGER NOT NULL,
        PRIMARY KEY(id))`,

    SELECT_ALL_TPS: /*sql*/`
        SELECT *
        FROM lastTPS`,

    SELECT_TP_BY_ID: /*sql*/`
        SELECT * 
        FROM lastTPS
        WHERE id = ?`,

    INSERT_TP: /*sql*/`
        INSERT INTO lastTPS
        VALUES (?, -1)`,

    UPDATE_TP: /*sql*/`
        UPDATE lastTPS
        SET lastTP = ?
        WHERE id = ?`,

    DELETE_TP: /*sql*/`
        DELETE FROM lastTPS
        WHERE id = ?`,

    //posts

    CREATE_POSTS_TABLE: /*sql*/`
        CREATE TABLE IF NOT EXISTS posts (
        id INTEGER,
        message TEXT,
        creation_time timestamp,
        user_id INTEGER,
        PRIMARY KEY(id))`,


    //PASSWORDS

    CREATE_LOGIN_TABLE: /*sql*/`
    CREATE TABLE IF NOT EXISTS login_data (
        username TEXT NOT NULL,
        password TEXT NOT NULL)`,


    SELECT_PASSWORD_BY_USERNAME: /*sql*/`
        SELECT password
        FROM login_data
        WHERE username = ?`,


}


export default QUERIES;