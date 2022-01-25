import { GridAlignment, GridValueFormatterParams } from "@mui/x-data-grid";

export const customFormatter = (params: GridValueFormatterParams) => parseFloat(params.value as string);

export const USER_COLUMNS = [
    {
        field: 'id',
        headerName: 'ID',
        hide: true
    },
    {
        field: 'first_name',
        headerName: 'Ad',
        flex: 1
    },
    {
        field: 'username',
        headerName: 'Kullanici Adi',
        flex: 1
    },
    {
        field: 'vip',
        headerName: 'VIP',
        flex: 1
    },
    {
        field: 'vip_timeout',
        headerName: 'VIP Bitis',
        flex: 1
    }


]



export const GRID_COLUMNS = [
    {
        field: 'id',
        headerName: 'ID',
        hide: true
    },
    {
        field: 'symbol',
        headerName: 'Coin',
        
    },
    {
        field: 'live_price',
        headerName: 'Anlık Fiyat',
        type: 'number',
        valueFormatter: customFormatter,
        
    },
    {
        field: 'buy_price',
        headerName: 'Alınacak Fiyat',
        type: 'number',
        valueFormatter: customFormatter,
        
    },
    {
        field: 'difference',
        headerName: 'Fark',
        type: 'number',
        valueFormatter: customFormatter,
        
    },
    {
        field: 'type',
        headerName: 'Tür',
        type: 'string',
        align: 'center' as GridAlignment,
        
    },
    {
        field: 'leverage',
        headerName: 'Kaldıraç',
        type: 'number',
        
    },
    {
        field: 'buy_condition',
        headerName: 'Alış Şartı',
        type: 'string',
        align: 'center' as GridAlignment,
        
    },
    {
        field: 'position',
        headerName: 'Pozisyon',
        type: 'string',
        align: 'center' as GridAlignment,
        
    },
    {
        field: 'take_profit_1',
        headerName: 'TP1',
        valueFormatter: customFormatter,
        type: 'number',
        
    },
    {
        field: 'take_profit_2',
        headerName: 'TP2',
        valueFormatter: customFormatter,
        type: 'number',
        
    },
    {
        field: 'take_profit_3',
        headerName: 'TP3',
        valueFormatter: customFormatter,
        type: 'number',
        
    },
    {
        field: 'take_profit_4',
        headerName: 'TP4',
        valueFormatter: customFormatter,
        type: 'number',
        
    },
    {
        field: 'take_profit_5',
        headerName: 'TP5',
        valueFormatter: customFormatter,
        type: 'number',
        
    },
    {
        field: 'tp_condition',
        headerName: 'TP Şartı',
        type: 'string',
        align: 'center' as GridAlignment,
        

    },
    {
        field: 'stop_loss',
        headerName: 'SL',
        valueFormatter: customFormatter,
        type: 'number',
        
    },
    {
        field: 'sl_condition',
        headerName: 'SL Şartı',
        type: 'string',
        align: 'center' as GridAlignment,
        
    },



];


