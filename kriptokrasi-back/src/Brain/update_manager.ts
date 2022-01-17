import _ from 'lodash';

export default class UpdateManager {
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