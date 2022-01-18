export async function profitCalculator(price, buyPrices) {
    if (price >= buyPrices[5]) {
        let tp5 = (buyPrices[5] - price) * (20 / buyPrices[5]) + (buyPrices[4] - price) * (20 / buyPrices[4]) + (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp4 = (buyPrices[4] - price) * (20 / buyPrices[4]) + (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp3 = (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp2 = (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp1 = (buyPrices[1] - price) * (20 / buyPrices[1]);

        return [(buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2, tp3, tp4, tp5];
    }
    else if (price >= buyPrices[4]) {
        let tp4 = (buyPrices[4] - price) * (20 / buyPrices[4]) + (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp3 = (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp2 = (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp1 = (buyPrices[1] - price) * (20 / buyPrices[1]);

        return [(buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2, tp3, tp4, buyPrices[5]];
    }
    else if (price >= buyPrices[3]) {
        let tp3 = (buyPrices[3] - price) * (20 / buyPrices[3]) + (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp2 = (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp1 = (buyPrices[1] - price) * (20 / buyPrices[1]);

        return [(buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2, tp3, buyPrices[4], buyPrices[5]];
    }
    else if (price >= buyPrices[2]) {
        let tp2 = (buyPrices[2] - price) * (20 / buyPrices[2]) + (buyPrices[1] - price) * (20 / buyPrices[1]);
        let tp1 = (buyPrices[1] - price) * (20 / buyPrices[1]);

        return [(buyPrices[0] - price) * (100 / buyPrices[0]), tp1, tp2, buyPrices[3], buyPrices[4], buyPrices[5]];
    }
    else if (price >= buyPrices[1]) {
        let tp1 = (buyPrices[1] - price) * (20 / buyPrices[1]);

        return [(buyPrices[0] - price) * (100 / buyPrices[0]), tp1, buyPrices[2], buyPrices[3], buyPrices[4], buyPrices[5]];
    }
    else return [(buyPrices[0] - price) * (100 / buyPrices[0]), buyPrices[1], buyPrices[2], buyPrices[3], buyPrices[4], buyPrices[5]];
}