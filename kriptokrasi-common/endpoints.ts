
const API_VERSION = 1;
const PREFIX = `/api/v${API_VERSION}/`;


function createPath(path: string) {
    return PREFIX + path
}

const ENDPOINTS = {

    CREATE_ORDER: createPath('create_order'),
    ACTIVATE_ORDERS: createPath('activate_orders'),

    GET_SYMBOLS: createPath('get_symbols'),
    GET_WAITING_ORDERS: createPath('get_waiting_orders'),
    GET_ACTIVE_ORDERS: createPath('get_active_orders'),
    GET_PAST_ORDERS: createPath('get_past_orders'),

    GET_ALL_USERS: createPath('get_all_users'),
    DELETE_USERS: createPath('delete_users'),
    UPDATE_VIP: createPath('update_vip'),

    DELETE_ORDERS: createPath('delete_orders'),

    SEND_TELEGRAM_MESSAGE: createPath('send_telegram_message'),


    LOGIN: createPath('login_request'),
    WEBHOOK: createPath('webhook'),

    DEV_LIVE_PRICE: createPath('dev_live_price'),
}

export default ENDPOINTS;