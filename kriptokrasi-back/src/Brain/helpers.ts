import Brain from "./main";

export function profitCalculatorAfterStop(price: number, buyPrices: number[], leverage: number, lastTP: number): number[] {
    let tp = 0;
    let profits: number[] = [-leverage * (buyPrices[0] - price) * (100 / buyPrices[0])];
    for (let i = 0; i <= lastTP; i++) {
        tp += leverage * ((buyPrices[i + 1] - buyPrices[0]) * (20 / buyPrices[0]));
        profits.push(tp);
    }
    return profits;
}

export function profitCalculator(price: number, buyPrices: number[], leverage: number, lastTP: number): number[] {
    let profits = [-leverage * (buyPrices[0] - price) * (100 / buyPrices[0])];
    for (let i = 0; i <= lastTP; i++) {
        let tp = 0;
        tp = leverage * ((buyPrices[i + 1] - buyPrices[0]) * (100 / buyPrices[0]));
        profits.push(tp);
    }
    return profits;
}