"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MSG = {
    GENERAL_ERROR: {
        tr: "Bir hata olustu",
        en: "Something is wrong."
    },
    INVALID_REQUEST: {
        tr: "Gecersiz istek",
        en: "Invalid Request"
    },
    ORNEK_FUNC: (a) => {
        return "Selamlar";
    },
    LONGSHORT_ERROR: {
        tr: `Coin yazmayı tekrar deneyin. ör: ls btc-usdt`,
        en: 'Try writing the coin name again. ex: ls btc-usdt'
    },
    LONGSHORT: (ratio1, pressure1, ratio2, pressure2, ratio3, pressure3, ratio4, pressure4, language) => {
        if (language == 'TR') {
            let tr = `15 Dakika -> Ratio: ${ratio1} -> ${pressure1} \n 1 Saat -> Ratio: ${ratio2} -> ${pressure2} \n 4 Saat -> Ratio: ${ratio3} -> ${pressure3} \n 1 Gün -> Ratio: ${ratio4} -> ${pressure4}`;
            return tr;
        }
        let en = `15 Minutes ->  Ratio: ${ratio1} -> ${pressure1} \n 1 Hour -> Ratio: ${ratio2} -> ${pressure2} \n 4 Hours -> Ratio: ${ratio3} -> ${pressure3} \n 1 Day -> Ratio: ${ratio4} -> ${pressure4}`;
        return en;
    },
    CURRENTLS_ERROR: {
        tr: `Coin yazmayı tekrar deneyin. ör: gls btc`,
        en: 'Try writing the coin name again. ex: gls btc'
    },
    TOTALLIQ_ERROR: {
        tr: 'Yazdığınız coinde bir yanlışlık var.',
        en: 'There is something wrong with the coin you entered.'
    }
};
//MSG.ORNEK_FUNC(123);
exports.default = MSG;
