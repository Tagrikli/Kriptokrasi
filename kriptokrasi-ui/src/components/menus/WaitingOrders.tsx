import { DataGrid, GridAlignment, GridValueFormatterParams, GridSelectionModel } from '@mui/x-data-grid';
import { Backdrop, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { ECompare, EPosition, EType, TAddOrder_Norm } from '../../kriptokrasi-common/types';
import { toast } from 'react-toastify';
import { BASE_URL, MESSAGES } from '../../kriptokrasi-common/consts';

const customFormatter = (params: GridValueFormatterParams) => parseFloat(params.value as string).toFixed(6);


const columns = [
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
        headerName: 'Anlik Fiyat',
    },
    {
        field: 'buy_price',
        headerName: 'Alinacak Fiyat',
        type: 'number',
        valueFormatter: customFormatter,
    },
    {
        field: 'diff',
        headerName: 'Fark',
        valueFormatter: customFormatter,
        type: 'number',
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


const beautifyData = (data_arr: TAddOrder_Norm[]) => {

    let beautified = data_arr.map(data => {



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

        const condModify = (condition: ECompare | string) => {

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


        return data;

    })

    return beautified;

}




export default function WaitingOrders() {

    const [rows, setRows] = useState<TAddOrder_Norm[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
    const [loading, setLoading] = useState(false);

    const selectionModelChangeHandler = (selection_model: GridSelectionModel) => {
        setSelectionModel(selection_model);
    }

    const deleteClickHandler = async () => {

        const sel_count = selectionModel.length;

        if (sel_count) {
            setLoading(true);
            const selections = selectionModel;

            try {
                let response = await fetch(`${BASE_URL}/api/v1/delete_orders`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(selections)
                })

                if (response.status === 200) {
                    setLoading(false);
                    toast.success(MESSAGES.SUCCESS.ORDER.DELETE);

                } else {
                    setLoading(false);
                    toast.error(MESSAGES.ERROR.ORDER.DELETE)
                }

            } catch (error: any) {
                setLoading(false);
                toast.error(error.message);
            }
        }
    }

    const uploadClickHandler = async () => {
        const sel_count = selectionModel.length;

        if (sel_count) {
            setLoading(true);
            const selections = selectionModel;

            try {
                let response = await fetch(`${BASE_URL}/api/v1/activate_orders`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(selections)
                })

                if (response.status === 200) {
                    setLoading(false);
                    toast.success(MESSAGES.SUCCESS.ORDER.ACTIVATE);

                } else {
                    setLoading(false);
                    toast.error(MESSAGES.ERROR.ORDER.ACTIVATE)
                }

            } catch (error: any) {
                setLoading(false);
                toast.error(error.message);
            }
        }
    }

    useEffect(() => {
        fetch(`${BASE_URL}/api/v1/get_inactive_orders`)
            .then(data => data.json())
            .then((data_arr: TAddOrder_Norm[]) => { setRows(beautifyData(data_arr)); console.log(data_arr); });
    }, [loading])


    return <Container maxWidth="xl" sx={{
        p: { xs: 0, md: 5 },
    }}
    >

        <DataGrid
            autoHeight={true}
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
            onSelectionModelChange={selectionModelChangeHandler}
        />


        <Stack spacing={3} direction={'row'} p={5}>
            <Button color='success' onClick={uploadClickHandler}>YÜKLE</Button>
            <Button color='error' onClick={deleteClickHandler}>SEÇİLENLERİ SİL</Button>
        </Stack>


        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        >
            <CircularProgress size={60} color="inherit" />
        </Backdrop>

    </Container>

}