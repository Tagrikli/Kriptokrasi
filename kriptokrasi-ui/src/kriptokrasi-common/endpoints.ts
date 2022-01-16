
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

    DELETE_ORDERS: createPath('delete_orders'),

    WEBHOOK: createPath('webhook'),

}

export default ENDPOINTS;