"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitlist = void 0;
const logger_1 = __importDefault(require("./Logger/logger"));
class Waitlist {
    delay;
    waitlist;
    constructor(delay = 10000) {
        this.delay = delay;
        this.waitlist = [];
    }
    ;
    push(user_id) {
        //this.waitlist.push(user_id);
        //setTimeout(() => this.waitlist.shift(), this.delay)
    }
    find(user_id) {
        return this.waitlist.find(id => id === user_id);
    }
}
exports.default = Waitlist;
exports.waitlist = new Waitlist(10000);
logger_1.default.info('Waitlist created');
