import fs from 'fs';
import path from 'path';

const queries = fs.readFileSync(path.join(__dirname, 'queries.sql'));
var query_list = queries.toLocaleString().split(';').map(querie => querie.trim());

const QUERIES = {

    CREATE_USERS_TABLE: query_list[0],
    CREATE_CODES_TABLE: query_list[1],
    CREATE_POSTS_TABLE: query_list[2],
    CREATE_ORDERS_TABLE: query_list[6],
    CREATE_PAST_TABLE : query_list[10],

    SELECT_USER_BY_ID: query_list[3],
    SELECT_USER_BY_VIP: query_list[5],
    SELECT_ORDER_BY_ID: query_list[14],
    SELECT_ACTIVE_ORDERS: query_list[8],
    SELECT_WAITING_ORDERS: query_list[9],
    SELECT_PAST_ORDERS: query_list[13],

    INSERT_USER: query_list[4],
    INSERT_WAITING_ORDER: query_list[7],
    INSERT_PAST_ORDER: query_list[15],

    DELETE_ORDERS_BY_ID: query_list[11],
    ACTIVATE_ORDER_BY_ID: query_list[12]

} // max: 11



export default QUERIES;