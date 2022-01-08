import CONFIG from './kriptokrasi-common/config.json';


const ws_client = new WebSocket(`ws://localhost:${CONFIG.network.express_port}`)

ws_client.onmessage = (data) => {
    const message = data.data;
    const type = message.type;

    console.log(message);

    switch (type) {
        case 0:
            break;
        
        default:
            break;
    }
}



