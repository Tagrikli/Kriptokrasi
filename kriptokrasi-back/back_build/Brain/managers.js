"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateManager = exports.ActivationProcess = exports.ReactUpdater = void 0;
const lodash_1 = __importDefault(require("lodash"));
class ReactUpdater {
    wss;
    constructor(wss) {
        this.wss = wss;
    }
    updateClients(data) {
        this.wss.clients.size && this.wss.clients.forEach(client => client.send(JSON.stringify(data)));
    }
}
exports.ReactUpdater = ReactUpdater;
class ActivationProcess {
    in_process_ids;
    constructor() {
        this.in_process_ids = [];
    }
    inProcess(order_id) {
        return this.in_process_ids.includes(order_id);
    }
    addProcess(order_id) {
        this.in_process_ids.push(order_id);
    }
    removeProcess(order_id) {
        this.in_process_ids = this.in_process_ids.filter(id => order_id !== id);
    }
}
exports.ActivationProcess = ActivationProcess;
class UpdateManager {
    symbols;
    update_table;
    timeout;
    constructor(timeout) {
        this.symbols = [];
        this.update_table = [];
        this.timeout = timeout;
    }
    shouldUpdate(symbol) {
        const index = this.symbols.findIndex(sym => sym === symbol);
        if (this.update_table[index]) {
            this.justUpdated(index);
            return true;
        }
        else {
            return false;
        }
    }
    justUpdated(index) {
        this.update_table[index] = false;
        setTimeout(() => {
            this.update_table[index] = true;
        }, this.timeout);
    }
    updateSymbols(symbols) {
        this.symbols = lodash_1.default.uniq(symbols);
        this.update_table = new Array(this.symbols.length);
        this.resetUpdates();
    }
    resetUpdates() {
        this.update_table = this.update_table.fill(true);
    }
}
exports.UpdateManager = UpdateManager;
