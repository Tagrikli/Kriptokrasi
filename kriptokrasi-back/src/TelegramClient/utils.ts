import { CRY_TITLES } from "../utils/consts";


export function cryptoMessageParser(message: string) {


    let lines = message.split('\n');

    let title = lines[0];

    let index = CRY_TITLES.findIndex(cry_title => { title.includes(cry_title) });

    if (index !== -1) {


        switch (index) {
            case 0://'Trend Indicator'

                break;
            case 1://'BTC-USDT - Binance'

                break;
            case 2://'xTrade: BTC-USD - Kraken'

                break;
            case 3://'Market Buy Orders'

                break;
            case 4://'Market Sell Orders'

                break;
            case 5://Undefined

                break;
            case 6://Undefined

                break;
            case 7://Undefined

                break;
            case 8://Undefined

                break;

            default:
                break;
        }


    }



    let content = lines.slice(1, lines.length - 1);

    let time = lines[lines.length - 1];

    return content[0];


}