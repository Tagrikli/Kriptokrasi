import { ECompare, EPosition, EType, TOrder } from "../kriptokrasi-common/order_types";

export const beautifyData = (data_arr: TOrder[]) => {

    let data_arr_ = [...data_arr] as any[];


    let beautified = data_arr_.map(data => {


        let position = data.position;
        switch (position) {
            case EPosition.LONG:
                data.position = 'LONG';
                break;
            case EPosition.SHORT:
                data.position = 'SHORT';
                break;

            default:
                break;
        }


        let type = data.type;
        switch (type) {
            case EType.SPOT:
                data.type = 'SPOT';
                break;
            case EType.VADELI:
                data.type = 'VADELI';
                break;
            default:
                break;
        }

        const condModify = (condition: ECompare) => {

            switch (condition) {
                case ECompare.EQ:
                    return '=';
                case ECompare.LT:
                    return '<';
                case ECompare.GT:
                    return '>';
                default:
                    return ''
            }
        }

        data.buy_condition = condModify(data.buy_condition);
        data.sl_condition = condModify(data.sl_condition);
        data.tp_condition = condModify(data.tp_condition);
        data.live_price = 0;

        return data;

    })

    return beautified;

}