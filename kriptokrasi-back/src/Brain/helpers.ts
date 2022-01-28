import Brain from "./main";

export function profitCalculator(price, buyPrices, leverage, lastTP) {
    let tp = 0;
    let profits = [-leverage * (buyPrices[0] - price) * (100 / buyPrices[0])];
    for (let i =0; i<=lastTP; i++){
        tp+= leverage * ((buyPrices[i+1] - buyPrices[0]) * (20 / buyPrices[0]));
        profits.push(tp);
    }
    return profits;
}