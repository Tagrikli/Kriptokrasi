import { ECompare, EPosition, EType, TOrder, TUserDB } from "../kriptokrasi-common/order_types";
import TimeAgo from 'javascript-time-ago';
import turkish from 'javascript-time-ago/locale/tr.json';

TimeAgo.addDefaultLocale(turkish);
const timeAgo = new TimeAgo('tr')

export const timeFormatter = (timeout: number) => timeAgo.format(timeout);



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
                delete data.position
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

        data.take_profit_1 = data.tp_data[0];
        data.take_profit_2 = data.tp_data[1];
        data.take_profit_3 = data.tp_data[2];
        data.take_profit_4 = data.tp_data[3];
        data.take_profit_5 = data.tp_data[4];

        delete data.tp_data;

        data.buy_condition = condModify(data.buy_condition);
        data.sl_condition = condModify(data.sl_condition);
        data.tp_condition = condModify(data.tp_condition);
        data.live_price = undefined;

        return data;

    })

    return beautified;

}

export function beautifyUsers(users: TUserDB[]) {


    let users_ = users.slice() as any[];

    users_.map(user => {

        user.id = user.user_id;

        if (user.vip) {
            user.vip = 'EVET';
        } else {
            user.vip = 'HAYIR';
            delete user.vip_timeout
        }

        if (user.vip_timeout !== undefined) {
            user.vip_timeout = timeFormatter(user.vip_timeout)
        }

        return user;

    })

    return users_;




}