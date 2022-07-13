
export enum ECompare {
    EQ,
    GT,
    LT,
    GTE,
    LTE
}

export enum EPosition {
    LONG,
    SHORT
}

export enum EType {
    SPOT,
    VADELI
}


export enum EStatus {
    WAITING,
    ACTIVE,
    PAST
}

export type TOrder = {

    id: number,
    type: EType,
    position: EPosition,


    symbol: string,
    buy_price: number,
    live_price?: number
    difference?: number

    stop_loss: number
    tp_data: number[] | string

    leverage: number
    tp_condition: ECompare
    sl_condition: ECompare
    buy_condition: ECompare

    status: EStatus
}



export type TOrder_Past = {
    id: number
    symbol: string
    timestamp: number
    position: EPosition
    type: EType
    leverage: number
    buy_price: number
    sell_price: number
    profit: number
    cancel: number
}

export type TUserDB = {
    user_id: number,
    is_bot: boolean,
    first_name: string,
    last_name?: string,
    username: string,
    vip_timeout: number,
    vip: boolean,
    language: string
}