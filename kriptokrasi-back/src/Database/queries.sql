/*  */
CREATE TABLE IF NOT EXISTS `users` (
    user_id INTEGER NOT NULL,
    is_bot INTEGER,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    code_id INTEGER,
    code_timeout INTEGER,
    vip INTEGER,
    PRIMARY KEY('user_id')
);
/* */
CREATE TABLE IF NOT EXISTS `codes` (
    code_id PRIMARY KEY,
    code_timeout INTEGER,
    user_id INTEGER,
    code_day INTEGER
);
/* */
CREATE TABLE IF NOT EXISTS `posts` (
    id INTEGER,
    message TEXT,
    creation_time timestamp,
    user_id INTEGER,
    PRIMARY KEY('id' AUTOINCREMENT)
);
/* */
SELECT *
FROM users
WHERE user_id = ?;
/* */
INSERT
    OR IGNORE INTO users
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
/* */
SELECT *
FROM users
where vip = 1;
/* */
CREATE TABLE IF NOT EXISTS "orders" (
    "id" INTEGER NOT NULL,
    "symbol" TEXT,
    "position" INTEGER,
    "type" INTEGER,
    "leverage" INTEGER,
    "buy_price" INTEGER,
    "stop_loss" INTEGER,
    "buy_condition" INTEGER,
    "tp_condition" INTEGER,
    "sl_condition" INTEGER,
    "take-profit-1" INTEGER,
    "take-profit-2" INTEGER,
    "take-profit-3" INTEGER,
    "take-profit-4" INTEGER,
    "take-profit-5" INTEGER,
    "active" INTEGER,
    PRIMARY KEY("id")
);
/* INSERT INTO ORDERS */
INSERT INTO orders
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
/* SELECT ACTIVE ORDERS */
SELECT *
FROM orders
WHERE active = 1;
/* SELECT INACTIVE ORDERS */
SELECT *
FROM orders
WHERE active = 0;
/* DELETE ORDER BY ID */
DELETE FROM orders
WHERE id = ?;
/* ACTIVATE ORDER BY ID */
UPDATE orders
SET active = 1
WHERE id = ?;