import { DataGrid, GridSelectionModel } from '@mui/x-data-grid';
import { Backdrop, Button, CircularProgress, Container, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { TOrder } from '../../kriptokrasi-common/types/order_types';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../kriptokrasi-common/consts';
import { MESSAGES } from '../../utils/messages';
import { GRID_COLUMNS } from '../../utils/consts';
import { beautifyData } from '../../utils/order_functions';






export default function ActiveOrders(props: { ws: WebSocket }) {

    const [rows, setRows] = useState<TOrder[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
    const [loading, setLoading] = useState(false);



    props.ws.onmessage = (message) => {

        const data = JSON.parse(message.data);

        const [symbol, bid_price] = [data.symbol, data.bid_price];

        const row_index = rows.findIndex(row => row.symbol === symbol);
        if (row_index !== -1) {

            let rows_ = rows.slice();


            rows_[row_index].live_price = bid_price;
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


    useEffect(() => {
        fetch(`${BASE_URL}/api/v1/get_active_orders`)
            .then(data => data.json())
            .then((data_arr: TOrder[]) => { setRows(beautifyData(data_arr)); console.log(data_arr); });
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
            <Button color='error' onClick={deleteClickHandler}>SEÇİLENLERİ SİL</Button>
        </Stack>

        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        >
            <CircularProgress size={60} color="inherit" />
        </Backdrop>

    </Container >

}