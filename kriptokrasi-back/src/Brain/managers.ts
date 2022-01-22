import _ from 'lodash';
import { WebSocketServer } from 'ws';


export class ReactUpdater {
    wss: WebSocketServer


    constructor(wss: WebSocketServer) {
        this.wss = wss;
    }

    updateClients(data: any) {
        this.wss.clients.size && this.wss.clients.forEach(client => client.send(JSON.stringify(data)));
    }


}


export class ActivationProcess {
    in_process_ids: number[]

    constructor() {
        this.in_process_ids = []
    }

    inProcess(order_id: number) {
        return this.in_process_ids.includes(order_id);
    }

    addProcess(order_id: number) {
        this.in_process_ids.push(order_id);
    }

    removeProcess(order_id: number) {
        this.in_process_ids = this.in_process_ids.filter(id => order_id !== id);
    }


}


export class UpdateManager {
    symbols: string[]
    update_table: boolean[]

    timeout: number

    constructor(timeout: number) {
        this.symbols = []
        this.update_table = []
        this.timeout = timeout;
    }

    shouldUpdate(symbol: string) {

        const index = this.symbols.findIndex(sym => sym === symbol)

        if (this.update_table[index]) {
            this.justUpdated(index);
            return true;

        } else {
            return false;
        }

    }

    justUpdated(index: number) {
        this.update_table[index] = false;
        setTimeout(() => {
            this.update_table[index] = true
        }, this.timeout);
    }

    updateSymbols(symbols: string[]) {
        this.symbols = _.uniq(symbols);
        this.update_table = new Array(this.symbols.length);
        this.resetUpdates();
    }

    resetUpdates() {
        this.update_table = this.update_table.fill(true);
    }

}