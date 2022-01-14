/* 0 */
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
/*1 */
CREATE TABLE IF NOT EXISTS `codes` (
    code_id PRIMARY KEY,
    code_timeout INTEGER,
    user_id INTEGER,
    code_day INTEGER
);
/* 2*/
CREATE TABLE IF NOT EXISTS `posts` (
    id INTEGER,
    message TEXT,
    creation_time timestamp,
    user_id INTEGER,
    PRIMARY KEY('id')
);
/* 3*/
SELECT *
FROM users
WHERE user_id = ?;
/* 4*/
INSERT
    OR IGNORE INTO users
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
/* 5*/
SELECT *
FROM users
where vip = 1;
/* 6*/
CREATE TABLE IF NOT EXISTS `orders` (
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
    "tp_data" TEXT,
    "status" INTEGER,
    PRIMARY KEY('id', AUTOINCREMENT)
);
/* 7 INSERT INTO ORDERS */
INSERT INTO orders
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
/* 8 SELECT ACTIVE ORDERS */
SELECT *
FROM orders
WHERE status = 1;
/* 9 SELECT WAITING ORDERS */
SELECT *
FROM orders
WHERE status = 0;
/*10 CREATE PAST ORDERS */
CREATE TABLE IF NOT EXISTS `past` (
    "id" INTEGER NOT NULL,
    "symbol" TEXT,
    "timestamp" TEXT,
    "position" INTEGER,
    "type" INTEGER,
    "leverage" INTEGER,
    "buy_price" INTEGER,
    "sell_price" INTEGER,
    "profit" INTEGER,
    "cancel" INTEGER,
    PRIMARY KEY("id")
);
/* 11 DELETE ORDER BY ID */
DELETE FROM orders
WHERE id = ?;
/* 12 ACTIVATE ORDER BY ID */
UPDATE orders
SET active = 1
WHERE id = ?;
/* 13 CREATE PAST TABLE*/
SELECT *
FROM past;
/* 14 SELECT ORDER BY ID */
SELECT *
FROM orders
WHERE id = ?;
/* 15 INSERT PAST ORDER*/
INSERT INTO past
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
/*16 CREATE TP TABLE*/
CREATE TABLE IF NOT EXISTS `lastTPS` (
    "id" INTEGER NOT NULL,
    "lastTP" INTEGER NOT NULL,
    PRIMARY KEY("id")
);
/*17 INSERT TO TP TABLE */
INSERT INTO lastTPs
VALUES (?, 0);
/* 18 UPDATE TPS*/
UPDATE lastTPS
SET lastTP = lastTP + 1
WHERE id = ?;