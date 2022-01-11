

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
    type: EType | string,
    position: EPosition | string,
    symbol: String | Number,
    buy_price: Number,
    leverage: Number
    buy_condition: ECompare | string,
    tp_condition: ECompare | string,
    stop_loss: Number,
    sl_condition: ECompare | string
    active: number
}

export type TAddOrder_Array = TAddOrder_Temp & {
    take_profit: number[]
}

export type TAddOrder_Norm = TAddOrder_Temp & {
    live_price: number,
    id: number,
    'take-profit-1': number,
    'take-profit-2': number,
    'take-profit-3': number,
    'take-profit-4': number,
    'take-profit-5': number,
}


export enum EDialogAction {
    REMOVE_ITEM,
    UPLOAD_ITEM
}

export type TDialog = {
    title: string,
    content: string,
    action: EDialogAction
}


export type TConfigCredential = {
    app: {
        api_id: number,
        api_hash: string,
        session: string
    },
    bot: {
        token: string
    }
}

export type TConfigData = {
    credentials: {
        [user: string]: TConfigCredential
    },
    network: {
        express_port: number
    }
}