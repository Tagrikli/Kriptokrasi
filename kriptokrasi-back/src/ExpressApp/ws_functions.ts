import { logger } from "../Logger/logger";
import { wsServer } from "./express_app";


wsServer.on('connection', (socket, request) => {
    logger.debug('New Connection');
    socket.send("edison ben senin anan :))");
})

wsServer.on('message', (data) => {

    logger.debug('New message');

})