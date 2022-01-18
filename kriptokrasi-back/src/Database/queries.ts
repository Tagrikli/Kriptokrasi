
const QUERIES = {

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


    CREATE_POSTS_TABLE: /*sql*/`
        CREATE TABLE IF NOT EXISTS posts (
        id INTEGER,
        message TEXT,
        creation_time timestamp,
        user_id INTEGER,
        PRIMARY KEY(id))`,

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

    CREATE_TP_TABLE: /*sql*/`
        CREATE TABLE IF NOT EXISTS lastTPS (
        id INTEGER NOT NULL,
        lastTP INTEGER NOT NULL,
        PRIMARY KEY(id))`,

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

    SELECT_PAST_ORDERS: /*sql*/`
        SELECT *
        FROM past`,

    INSERT_USER: /*sql*/`
        INSERT OR IGNORE INTO users
        VALUES (?, ?, ?, ?, ?, ?, ?)`,

    INSERT_WAITING_ORDER: /*sql*/`
        INSERT INTO orders
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    INSERT_PAST_ORDER: /*sql*/`
        INSERT INTO past
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    INSERT_TP: /*sql*/`
        INSERT INTO lastTPs
        VALUES (?, 0)`,

    DELETE_ORDERS_BY_ID: /*sql*/`
        DELETE FROM orders
        WHERE id = ?`,

    ACTIVATE_ORDER_BY_ID: /*sql*/`
        UPDATE orders
        SET status = 1
        WHERE id = ?`,

    UPDATE_TP: /*sql*/`
        UPDATE lastTPS
        SET lastTP = lastTP + 1
        WHERE id = ?`

}


export default QUERIES;