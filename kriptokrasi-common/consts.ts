import CONFIG from './config.json';
import { GridValueFormatterParams, GridAlignment } from '@mui/x-data-grid';

export const MESSAGES = {

    ERROR: {

        ORDER: {
            ADD: 'Emir(ler) eklenemedi :(',
            DELETE: 'Emir(ler) silinemedi :(',
            ACTIVATE: 'Emir(ler) aktive edilemedi :(',
        },

        SERVER: {
            INTERNAL: 'Serverda bir hata mevcut :('
        }


    },

    SUCCESS: {


        ORDER: {
            ADD: 'Emir(ler) eklendi!',
            DELETE: 'Emir(ler) silindi!',
            ACTIVATE: 'Emir(ler) aktive edildi!',
        },
    }



}

const customFormatter = (params: GridValueFormatterParams) => parseFloat(params.value as string).toFixed(6);


export const GRID_COLUMNS = [
    {
        field: 'id',
        headerName: 'ID',
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
        align: 'center' as GridAlignment
    },
    {
        field: 'position',
        headerName: 'Pozisyon',
        type: 'string',
    },
    {
        field: 'take-profit-1',
        headerName: 'TP1',
        valueFormatter: customFormatter,

        type: 'number',
    },
    {
        field: 'take-profit-2',
        headerName: 'TP2',
        valueFormatter: customFormatter,

        type: 'number',
    },
    {
        field: 'take-profit-3',
        headerName: 'TP3',
        valueFormatter: customFormatter,

        type: 'number',
    },
    {
        field: 'take-profit-4',
        headerName: 'TP4',
        valueFormatter: customFormatter,

        type: 'number',
    },
    {
        field: 'take-profit-5',
        headerName: 'TP5',
        valueFormatter: customFormatter,

        type: 'number',
    },
    {
        field: 'tp_condition',
        headerName: 'TP Şartı',
        type: 'string',
        align: 'center' as GridAlignment

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
        align: 'center' as GridAlignment
    },



];


export const BASE_URL = 'http://localhost:5000';
export const WS_URL = 'localhost:5000';