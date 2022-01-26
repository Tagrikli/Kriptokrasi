import CONFIG from '../kriptokrasi-common/network.json';
import ENDPOINTS from '../kriptokrasi-common/endpoints';

const DEV = process.env.NODE_ENV === 'development';

const location = () => document.location.host;

const WEBSOCKET_URL = DEV ? new URL(`ws://localhost:${CONFIG.PORT}`) : new URL(`ws://${location()}:${CONFIG.PORT}`);
const EXPRESS_BASE = DEV ? `http://localhost:${CONFIG.PORT}` : `http://${location()}`;


var EXPRESS_ENDPOINTS: any = {};
Object.entries(ENDPOINTS).forEach(pair => {
    EXPRESS_ENDPOINTS[pair[0]] = new URL(EXPRESS_BASE + pair[1]);
})

export { WEBSOCKET_URL, EXPRESS_ENDPOINTS };
