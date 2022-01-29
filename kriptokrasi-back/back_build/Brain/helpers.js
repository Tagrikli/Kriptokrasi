"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitCalculator = exports.profitCalculatorAfterStop = void 0;
function profitCalculatorAfterStop(price, buyPrices, leverage, lastTP) {
    let tp = 0;
    let profits = [-leverage * (buyPrices[0] - price) * (100 / buyPrices[0])];
    for (let i = 0; i <= lastTP; i++) {
        tp += leverage * ((buyPrices[i + 1] - buyPrices[0]) * (20 / buyPrices[0]));
        profits.push(tp);
    }
    return profits;
}
exports.profitCalculatorAfterStop = profitCalculatorAfterStop;
function profitCalculator(price, buyPrices, leverage, lastTP) {
    let profits = [-leverage * (buyPrices[0] - price) * (100 / buyPrices[0])];
    for (let i = 0; i <= lastTP; i++) {
        let tp = 0;
        tp = leverage * ((buyPrices[i + 1] - buyPrices[0]) * (100 / buyPrices[0]));
        profits.push(tp);
    }
    return profits;
}
exports.profitCalculator = profitCalculator;
