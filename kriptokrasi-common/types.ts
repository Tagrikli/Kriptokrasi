



export enum ECompare {
    EQ,
    GT,
    LT,
}

export enum EPosition {
    LONG,
    SHORT
}

export enum EType {
    SPOT,
    VADELI
}

export type TAddOrder_Temp = {
    type: EType,
    position: EPosition,
    symbol: String | Number,
    buy_price: Number,
    leverage: Number
    buy_condition: ECompare,
    tp_condition: ECompare,
    stop_loss: Number,
    sl_condition: ECompare
}

export type TAddOrder_Array = TAddOrder_Temp & {
    take_profit: number[]
}

export type TAddOrder_Norm = TAddOrder_Temp & {
    id: number,
    'take-profit-1': number,
    'take-profit-2': number,
    'take-profit-3': number,
    'take-profit-4': number,
    'take-profit-5': number,
}