import { Backdrop, Button, Container, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { Box } from "@mui/system";
import { DataGrid, GridSelectionModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { TUserDB } from "../../kriptokrasi-common/order_types";
import { USER_COLUMNS } from "../../utils/consts";
import { EXPRESS_ENDPOINTS } from "../../utils/endpoint_manager";
import { MESSAGES } from "../../utils/messages";
import { beautifyUsers } from "../../utils/order_functions";

export default function MakeVIP() {

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<TUserDB[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        console.log(selectionModel);
    }, [selectionModel])

    useEffect(() => {

        fetch(EXPRESS_ENDPOINTS.GET_ALL_USERS)
            .then(data => data.json())
            .then((data_arr: TUserDB[]) => {
                setUsers(beautifyUsers(data_arr));
                console.log(data_arr);
            });


    }, [loading])

    const onVIPClick = async (event: any) => {

        console.log(duration);
        setLoading(true);

        const extensionInMilliseconds = duration * 1000 * 60 * 60 * 24;
        let data: { user_ids: GridSelectionModel, vip: boolean, extension: number };
        data = { user_ids: selectionModel, vip: false, extension: extensionInMilliseconds };
        const id = event.target.id;

        switch (id) {
            case 'make-vip':
                data.vip = true;
                data.extension = extensionInMilliseconds
                break;
            case 'cancel-vip':
                data.vip = false;
                data.extension = 0;
                break;
        }


        let result = await fetch(EXPRESS_ENDPOINTS.UPDATE_VIP, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (result.status === 200) {
            toast.success(MESSAGES.SUCCESS.VIP)
        } else {
            toast.error(MESSAGES.ERROR.VIP)
        }

        setLoading(false);



    }

    const durationChangeHandler = (event: any) => {

        const duration_ = parseInt(event.target.value);

        setDuration(duration_)
        console.log(duration_);

    }

    const selectionModelChangeHandler = (selection_model: GridSelectionModel) => {
        setSelectionModel(selection_model);
    }


    return <Container maxWidth="xl" sx={{
        p: { xs: 0, md: 5 },
    }}
    >

        <Stack spacing={5}>


            <DataGrid
                autoHeight={true}
                rows={users}
                columns={USER_COLUMNS}
                pageSize={10}
                rowsPerPageOptions={[5]}
                checkboxSelection
                loading={loading}
                disableSelectionOnClick
                onSelectionModelChange={selectionModelChangeHandler}
            />





            <Stack spacing={3} direction={'row'} p={5}>
                <Button color='success' id='make-vip' onClick={onVIPClick}>VIP YAP</Button>
                <Button color='error' id='cancel-vip' onClick={onVIPClick}>VIP KALDIR</Button>

                <FormControl >
                    <InputLabel id="duration-label">Süre</InputLabel>
                    <Select
                        labelId="duration-label"
                        id="duration-select"
                        value={duration}
                        label="Süre"
                        onChange={durationChangeHandler}
                    >
                        <MenuItem value={0}>Hiç</MenuItem>
                        <MenuItem value={7}>1 Hafta</MenuItem>
                        <MenuItem value={15}>15 Gün</MenuItem>
                        <MenuItem value={30}>1 Ay</MenuItem>
                        <MenuItem value={365 * 100}>Hep</MenuItem>
                    </Select>
                </FormControl>

            </Stack>






        </Stack>


    </Container >








}