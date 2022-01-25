import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import { Backdrop, Button, CircularProgress, Container, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MESSAGES } from '../../utils/messages';
import { GRID_COLUMNS } from '../../utils/consts';
import { beautifyData } from '../../utils/order_functions';
import { EStatus, TOrder } from '../../kriptokrasi-common/order_types';
import { EXPRESS_ENDPOINTS } from '../../utils/endpoint_manager';



export default function WaitingOrders(props: { ws: WebSocket }) {

    const [rows, setRows] = useState<TOrder[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
    const [loading, setLoading] = useState(false);

    props.ws.onmessage = (message) => {

        const data = JSON.parse(message.data);

        const symbol: string = data.symbol;
        const bid_price: number = data.bid_price;


        const rows_ = rows.map(row => {
            if (row.symbol === symbol) {
                row.live_price = bid_price;
                row.difference = bid_price - row.buy_price;
            }
            return row;
        })

        setRows(rows_);
    }

    const selectionModelChangeHandler = (selection_model: GridSelectionModel) => {
        setSelectionModel(selection_model);
    }

    const deleteClickHandler = async () => {

        const sel_count = selectionModel.length;

        if (sel_count) {
            setLoading(true);

            try {
                let response = await fetch(EXPRESS_ENDPOINTS.DELETE_ORDERS, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ selections: selectionModel, type: EStatus.WAITING })
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
                let response = await fetch(EXPRESS_ENDPOINTS.ACTIVATE_ORDERS, {
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

        fetch(EXPRESS_ENDPOINTS.GET_WAITING_ORDERS)
            .then(data => data.json())
            .then((data_arr: TOrder[]) => { setRows(beautifyData(data_arr)); console.log(data_arr); });

    }, [loading])


    return <Container maxWidth="xl" sx={{
        p: { xs: 0, md: 5 },
    }}
    >

        <DataGrid
            density="comfortable"
            autoHeight={true}
            rows={rows}
            columns={GRID_COLUMNS}
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