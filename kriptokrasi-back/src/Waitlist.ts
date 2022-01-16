import logger from "./Logger/logger";


export default class Waitlist {
    delay: number;
    waitlist: number[]

    constructor(delay: number = 10000) {
        this.delay = delay;
        this.waitlist = []
    };

    push(user_id: number) {
        this.waitlist.push(user_id);
        setTimeout(() => this.waitlist.shift(), this.delay)
    }

    find(user_id: number) {
        return this.waitlist.find(id => id === user_id);
    }


}

export const waitlist = new Waitlist(10000);
logger.info('Waitlist created');