import { Label } from "@mui/icons-material";
import { Backdrop, Button, Container, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";
import { Box, minWidth } from "@mui/system";
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
    const [users_, setUsers_] = useState<TUserDB[]>([]);
    const [onlyVIP, setOnlyVIP] = useState(false);
    const [search, setSearch] = useState('');
    const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        console.log(selectionModel);
    }, [selectionModel])


    useEffect(() => {
        setUsers_(filterByUsername(filterByVIP(users)));
    }, [onlyVIP, search])


    useEffect(() => {

        fetch(EXPRESS_ENDPOINTS.GET_ALL_USERS)
            .then(data => data.json())
            .then((data_arr: TUserDB[]) => {

                const beautified = beautifyUsers(data_arr);

                setUsers(beautified);
                setUsers_(beautified);
            });

    }, [loading])


    const filterByVIP = (data: TUserDB[]) => {
        return onlyVIP ? data.filter(user => user.vip as any === "EVET") : data;
    }

    const filterByUsername = (data: TUserDB[]) => {
        return search.length > 0 ? data.filter(user => user.username.toLowerCase().includes(search.toLowerCase())) : data;
    }


    const onFilterChange = (_: any, checked: boolean) => {
        setOnlyVIP(checked);
    }

    const onFilterUsername = (event: any) => {

        setSearch(event.target.value);

    }


    const onUserDelete = async (event: any) => {

        setLoading(true);

        let result = await fetch(EXPRESS_ENDPOINTS.DELETE_USERS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_ids: selectionModel })
        })

        if (result.status === 200) {
            toast.success(MESSAGES.SUCCESS.USER_DELETE)
        } else {
            toast.error(MESSAGES.ERROR.USER_DELETE)
        }

        setLoading(false);
    }

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


            <Box sx={{
                display: 'flex',
                flexDirection: { md: 'row', xs: 'column' },
                justifyContent: 'space-evenly',
                alignItems: 'stretch',
                flexWrap: "wrap"
            }}>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 3
                }}>


                    <Button sx={{ margin: 1 }} color='success' id='make-vip' onClick={onVIPClick}>VIP YAP</Button>
                    <Button sx={{ margin: 1 }} color='error' id='cancel-vip' onClick={onVIPClick}>VIP KALDIR</Button>

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
                </Box>



                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 3
                }}>

                    <Typography>Herkes</Typography>
                    <Switch onChange={onFilterChange} />
                    <Typography>Sadece VIP</Typography>

                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 3
                }}>

                    <TextField sx={{ maxWidth: 300 }} label='Kullanici Adi' onChange={onFilterUsername}></TextField>

                </Box>


                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 3
                }}>

                    <Button sx={{ margin: 1 }} color='error' id='delete-user' onClick={onUserDelete}>Kullanicilari Sil</Button>

                </Box>

            </Box>







            <DataGrid

                autoHeight={true}
                rows={users_}
                columns={USER_COLUMNS}
                pageSize={10}
                rowsPerPageOptions={[5]}
                checkboxSelection
                loading={loading}
                initialState={{
                    filter: {
                        filterModel: {
                            items: [{ columnField: 'VIP', operatorValue: 'equals', value: 'EVET' }],
                        },
                    },
                }}
                disableSelectionOnClick
                onSelectionModelChange={selectionModelChangeHandler}
            />



        </Stack>


    </Container >








}