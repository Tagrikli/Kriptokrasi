import { Backdrop, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { Box } from "@mui/system";
import { DataGrid, GridSelectionModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { TUserDB } from "../../kriptokrasi-common/order_types";
import { USER_COLUMNS } from "../../utils/consts";
import { EXPRESS_ENDPOINTS } from "../../utils/endpoint_manager";
import { beautifyUsers } from "../../utils/order_functions";

export default function MakeVIP() {

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<TUserDB[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
    const [duration, setDuration] = useState(7);

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


    }, [])


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


        <Stack spacing={2} m={10} direction='row' justifyContent='space-evenly'>



            <Stack direction='column'>


                <Button>VIP Yap</Button>
                <Button>VIP Kaldir</Button>
                <Button>Sure Uzat</Button>


            </Stack>


            <Stack direction='row'>


                <Box>


                    <FormControl >
                        <InputLabel id="duration-label">Süre</InputLabel>
                        <Select
                            labelId="duration-label"
                            id="duration-select"
                            value={duration}
                            label="Süre"
                            onChange={durationChangeHandler}
                        >
                            <MenuItem value={7}>1 Hafta</MenuItem>
                            <MenuItem value={15}>15 Gün</MenuItem>
                            <MenuItem value={30}>1 Ay</MenuItem>
                        </Select>
                    </FormControl>

                </Box>

            </Stack>

        </Stack>

    </Container >








}