import { Backdrop, Button, CircularProgress, Container, FormControl, FormControlLabel, FormLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
//import { EType, EPosition, ECompare, TAddOrder_Norm, TAddOrder_Array } from "../../kriptokrasi-common/types";
import { EPosition, ECompare, EType, TOrder, EStatus } from "../../kriptokrasi-common/types/order_types";
import { toast } from 'react-toastify';
import { Box } from "@mui/system";
import { BASE_URL } from "../../kriptokrasi-common/consts";
import { MESSAGES } from "../../utils/messages";
import { Add, Close } from '@mui/icons-material';


const FIELD_IDS = {
    SPOT_VADELI_RADIO: 'spot-vadeli-radio',
    LONG_SHORT_RADIO: 'long-short-radio',
    SYMBOL_SELECT: 'symbol-select',
    BUY_PRICE: 'buy-price',
    LEVERAGE: 'leverage',
    BUY_COND: 'buy-condition',
    TAKE_PROFIT: (index: number) => `take_profit_${index}`,
    TP_COND: 'tp-condition',
    STOP_LOSS: 'stop-loss',
    SL_COND: 'sl-condition'
}

const DEFAULT_PRICE = 0.000001;

const DEFAULT_ORDER: TOrder = {

    position: EPosition.LONG,
    type: EType.SPOT,
    symbol: 'ABCDE',

    buy_price: DEFAULT_PRICE,
    buy_condition: ECompare.EQ,

    leverage: 1,

    tp_data: [],
    tp_condition: ECompare.EQ,

    stop_loss: DEFAULT_PRICE,
    sl_condition: ECompare.EQ,

    status: EStatus.WAITING
}

const finalizeData = (data: TOrder) => {

    let data_ = { ...data } as any;


    let tps = data_.take_profit;
    delete data_.take_profit;

    let tp_obj = {} as any;
    for (let i = 0; i < tps.length; i++) {
        let label = `take-profit-${i + 1}`;
        tp_obj[label] = tps[i];
    }

    return { id: Date.now(), ...data_, ...tp_obj } as TOrder;
}


export default function AddOrder() {

    const [data, setData] = useState(DEFAULT_ORDER);
    const [loading, setLoading] = useState(false);
    const [symbols, setSymbols] = useState<string[]>([]);


    const getSymbols = async () => {
        fetch(`${BASE_URL}/api/v1/get_symbols`).then(values => values.json()).then(values => setSymbols(values));
    }


    useEffect(() => {
        getSymbols();
    }, []);


    useEffect(() => {
        console.log(data);

    }, [data]);

    const removeTpHandler = () => {


        let tp_data_ = data.tp_data.slice();
        tp_data_.splice(tp_data_.length - 1, 1);
        setData({ ...data, tp_data: tp_data_ });

    }

    const addTpHandler = () => {

        let tp_data_ = data.tp_data.slice();
        tp_data_.push(DEFAULT_PRICE);

        console.log(tp_data_);


        setData({ ...data, tp_data: tp_data_ });

    }


    const createOrder = async () => {

        setLoading(true);

        const data_normalized = finalizeData(data);
        console.log(data_normalized);


        try {

            let result = await fetch(`${BASE_URL}/api/v1/create_order/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data_normalized)
            })


            if (result.status === 200) {
                setLoading(false);
                toast.success(MESSAGES.SUCCESS.ORDER.ADD);
            } else {
                setLoading(false);
                toast.error(MESSAGES.ERROR.ORDER.ADD);
            }


        } catch (error: any) {
            setLoading(false);
            toast.error(error.message);
        }

    }



    const changeHandler = (event: any) => {

        const id: string = event.target.id;
        const name = event.target.name;

        const value = event.target.value;



        if (id) {

            if (id.includes('take_profit')) {

                const index = parseInt(id.split('_')[2]);
                var tp_data_ = [...data.tp_data];
                tp_data_[index] = parseFloat(value);
                setData({ ...data, tp_data: tp_data_ });

            } else {

                switch (id) {
                    case FIELD_IDS.BUY_PRICE:
                        setData({ ...data, buy_price: parseFloat(value) });
                        break;
                    case FIELD_IDS.LEVERAGE:
                        setData({ ...data, leverage: parseInt(value) });
                        break;
                    case FIELD_IDS.STOP_LOSS:
                        setData({ ...data, stop_loss: parseFloat(value) });
                        break;

                }
            }

        } else if (name) {
            switch (name) {
                case FIELD_IDS.SYMBOL_SELECT:
                    setData({ ...data, symbol: value });
                    break;
                case FIELD_IDS.BUY_COND:
                    setData({ ...data, buy_condition: parseInt(value) });
                    break;

                case FIELD_IDS.TP_COND:
                    setData({ ...data, tp_condition: parseInt(value) });
                    break;
                case FIELD_IDS.SL_COND:
                    setData({ ...data, sl_condition: parseInt(value) });
                    break;
                case FIELD_IDS.SPOT_VADELI_RADIO:
                    setData({ ...data, type: parseInt(value) });
                    break;
                case FIELD_IDS.LONG_SHORT_RADIO:
                    setData({ ...data, position: parseInt(value) });
                    break;

            }


        }


    }


    return <Container maxWidth="md" sx={{
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 4, md: 10 },

    }}
    >
        <Stack spacing={3}>

            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>

                <FormControl component="fieldset">
                    <FormLabel component="legend">Tür</FormLabel>
                    <RadioGroup
                        defaultValue={0}
                        name={FIELD_IDS.SPOT_VADELI_RADIO}
                        id={FIELD_IDS.SPOT_VADELI_RADIO}
                        onChange={changeHandler}
                        row
                    >
                        <FormControlLabel value={0} control={<Radio />} label="Spot" />
                        <FormControlLabel value={1} control={<Radio />} label="Vadeli" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset">
                    <FormLabel component="legend">Pozisyon</FormLabel>
                    <RadioGroup
                        defaultValue={0}
                        name={FIELD_IDS.LONG_SHORT_RADIO}
                        id={FIELD_IDS.LONG_SHORT_RADIO}
                        onChange={changeHandler}
                        row
                    >
                        <FormControlLabel value={0} control={<Radio />} label="Long" />
                        <FormControlLabel value={1} control={<Radio />} label="Short" />
                    </RadioGroup>
                </FormControl>

            </Box>

            <FormControl >
                <InputLabel id="symbol-label">Sembol</InputLabel>
                <Select
                    labelId="symbol-label"
                    id={FIELD_IDS.SYMBOL_SELECT}
                    label="Sembol"
                    onChange={changeHandler}
                    name={FIELD_IDS.SYMBOL_SELECT}
                >
                    {symbols.map((symbol: string, index: number) => <MenuItem key={index} value={symbol}>{symbol}</MenuItem>)}
                </Select>
            </FormControl>


            <TextField type="number" onChange={changeHandler} id={FIELD_IDS.BUY_PRICE} label="Alış Fiyatı" variant="outlined" defaultValue={DEFAULT_PRICE} InputProps={{ inputProps: { step: DEFAULT_PRICE } }} />
            <TextField type="number" onChange={changeHandler} id={FIELD_IDS.LEVERAGE} label="Kaldıraç" variant="outlined" defaultValue={1} />
            <FormControl >

                <InputLabel id="alim-sarti-label">Alım Şartı</InputLabel>

                <Select
                    labelId="alim-sarti-label"
                    id={FIELD_IDS.BUY_COND}
                    label="Alım Şartı"
                    onChange={changeHandler}
                    name={FIELD_IDS.BUY_COND}
                    defaultValue={ECompare.EQ}
                >
                    <MenuItem value={ECompare.EQ}>{'='}</MenuItem>
                    <MenuItem value={ECompare.GT}>{'>'}</MenuItem>
                    <MenuItem value={ECompare.LT}>{'<'}</MenuItem>
                </Select>
            </FormControl>




            {data.tp_data.map((tp, index) =>
                <TextField sx={{ width: '%100' }} key={index} type="number" onChange={changeHandler} id={FIELD_IDS.TAKE_PROFIT(index)} label={`Take Profit ${index + 1}`} variant="outlined" defaultValue={DEFAULT_PRICE} InputProps={{ inputProps: { step: DEFAULT_PRICE } }} />
            )}


            <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Button color='primary' onClick={addTpHandler} endIcon={<Add />}>Add Take Profit</Button>
                <Button color='secondary' onClick={removeTpHandler} endIcon={<Close />}>Remove Take Profit </Button>
            </Box>

            <FormControl >
                <InputLabel id="tp-condition-label">TP Şartı</InputLabel>
                <Select
                    labelId="tp-condition-label"
                    id={FIELD_IDS.TP_COND}
                    label="TP Şartı"
                    onChange={changeHandler}
                    name={FIELD_IDS.TP_COND}
                    defaultValue={ECompare.EQ}
                >
                    <MenuItem value={ECompare.EQ}>{'='}</MenuItem>
                    <MenuItem value={ECompare.GT}>{'>'}</MenuItem>
                    <MenuItem value={ECompare.LT}>{'<'}</MenuItem>
                </Select>
            </FormControl>


            <TextField type="number" id={FIELD_IDS.STOP_LOSS} onChange={changeHandler} label="Stop Loss" variant="outlined" defaultValue={DEFAULT_PRICE} InputProps={{ inputProps: { step: DEFAULT_PRICE } }} />


            <FormControl >

                <InputLabel id="sl-condition-label">SL Şartı</InputLabel>

                <Select
                    labelId="sl-condition-label"
                    id={FIELD_IDS.SL_COND}
                    label="SL Şartı"
                    onChange={changeHandler}
                    name={FIELD_IDS.SL_COND}
                    defaultValue={ECompare.EQ}
                >
                    <MenuItem value={ECompare.EQ}>{'='}</MenuItem>
                    <MenuItem value={ECompare.GT}>{'>'}</MenuItem>
                    <MenuItem value={ECompare.LT}>{'<'}</MenuItem>
                </Select>
            </FormControl>



            <Button onClick={createOrder} variant="contained">Ekle</Button>

        </Stack>

        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        >
            <CircularProgress size={60} color="inherit" />
        </Backdrop>

    </Container >






}