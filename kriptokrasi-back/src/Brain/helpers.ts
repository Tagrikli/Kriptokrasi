import Brain from "./main";

export function profitCalculator(price, buyPrices, condition, leverage) {
    if (Brain.conditionWorker(price, buyPrices[5], condition)) {
        let tp5 = leverage * ((buyPrices[5] - price) * (20 / buyPrices[5]) + (buyPrices[4] - price) * (20 / buyPrices[4]) + (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp4 = leverage * ((buyPrices[4] - price) * (20 / buyPrices[4]) + (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp3 = leverage * ((buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp2 = leverage * ((buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp1 = leverage * ((buyPrices[1] - price) * (20 / buyPrices[1]));

        return [leverage * (buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2, tp3, tp4, tp5];
    }
    else if (Brain.conditionWorker(price, buyPrices[5], condition)) {
        let tp4 = leverage * ((buyPrices[4] - price) * (20 / buyPrices[4]) + (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp3 = leverage * ((buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp2 = leverage * ((buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp1 = leverage * ((buyPrices[1] - price) * (20 / buyPrices[1]));

        return [leverage * (buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2, tp3, tp4];
    }
    else if (Brain.conditionWorker(price, buyPrices[5], condition)) {
        let tp3 = leverage * ((buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp2 = leverage * ((buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp1 = leverage * ((buyPrices[1] - price) * (20 / buyPrices[1]));

        return [leverage * (buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2, tp3];
    }
    else if (Brain.conditionWorker(price, buyPrices[5], condition)) {
        let tp2 = leverage * ((buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]));
        let tp1 = leverage * ((buyPrices[1] - price) * (20 / buyPrices[1]));

        return [leverage * (buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2];
    }
    else if (Brain.conditionWorker(price, buyPrices[5], condition)) {
        let tp1 = leverage * ((buyPrices[1] - price) * (20 / buyPrices[1]));

        return [leverage * (buyPrices[0] - price) * (100 / buyPrices[0]), tp1];
    }
    else return [leverage * (buyPrices[0] - price) * (100 / buyPrices[0])];
}