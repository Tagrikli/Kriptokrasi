import { DataGrid, GridAlignment, GridValueFormatterParams, GridSelectionModel } from '@mui/x-data-grid';
import { Backdrop, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { ECompare, EPosition, EType, TAddOrder_Norm } from '../../kriptokrasi-common/types';
import { toast } from 'react-toastify';
import { BASE_URL, MESSAGES, WS_URL } from '../../kriptokrasi-common/consts';
import { GRID_COLUMNS } from '../../kriptokrasi-common/consts';




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
        data.live_price = 0;

        return data;

    })

    return beautified;

}




export default function WaitingOrders(props: { ws: WebSocket }) {

    const [rows, setRows] = useState<TAddOrder_Norm[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
    const [loading, setLoading] = useState(false);

    props.ws.onmessage = (message) => {

        const data = JSON.parse(message.data);

        const [symbol, bid_price] = [data.symbol, data.bid_price];

        const row_index = rows.findIndex(row => row.symbol === symbol);
        if (row_index !== -1) {

            let rows_ = rows.slice();

            rows_[row_index].live_price = bid_price;
            rows_[row_index].difference = rows_[row_index].live_price - rows_[row_index].buy_price;
            setRows(rows_);

            
        }
        //console.log(data);

    }

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
            columns={GRID_COLUMNS}
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