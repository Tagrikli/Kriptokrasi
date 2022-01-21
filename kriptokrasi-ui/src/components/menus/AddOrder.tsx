import { Backdrop, Button, CircularProgress, Container, FormControl, FormControlLabel, FormLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { EPosition, ECompare, EType, TOrder, EStatus } from "../../kriptokrasi-common/order_types";
import { toast } from 'react-toastify';
import { Box } from "@mui/system";
import { MESSAGES } from "../../utils/messages";
import { Add, Close } from '@mui/icons-material';
import { EXPRESS_ENDPOINTS } from "../../utils/endpoint_manager";


const TP_PREFIX = 'take_profit_';
const extractTpIndex = (tp_id: string) => parseInt(tp_id.split('_')[2]);

const FIELD_IDS = {
    SPOT_VADELI_RADIO: 'spot-vadeli-radio',
    LONG_SHORT_RADIO: 'long-short-radio',
    SYMBOL_SELECT: 'symbol-select',
    BUY_PRICE: 'buy-price',
    LEVERAGE: 'leverage',
    BUY_COND: 'buy-condition',
    TAKE_PROFIT: (index: number) => `${TP_PREFIX}${index}`,
    TP_COND: 'tp-condition',
    STOP_LOSS: 'stop-loss',
    SL_COND: 'sl-condition'
}

const DEFAULT_PRICE = 0.000001;

const DEFAULT_ORDER: Omit<TOrder, 'tp_data'> & { tp_data: number[] } = {

    id: 0,
    position: EPosition.LONG,
    type: EType.SPOT,
    symbol: '',

    buy_price: DEFAULT_PRICE,
    buy_condition: ECompare.EQ,

    leverage: 1,

    tp_data: [...Array(5).fill(DEFAULT_PRICE)],
    tp_condition: ECompare.EQ,

    stop_loss: DEFAULT_PRICE,
    sl_condition: ECompare.EQ,

    status: EStatus.WAITING
}

const prepareOrder = (data: TOrder) => {

    return { ...data, id: Date.now() } as TOrder;
}

const isSorted = (list: number[], inc: boolean) => {

    let sorted = true;
    console.log(list);

    for (var j = 0; j < list.length - 1; j++) {
        if (((list[j] > list[j + 1]) && inc) || ((list[j] < list[j + 1]) && !inc)) {
            sorted = false;
            break;
        }
    }

    return sorted

}


export default function AddOrder() {

    const [data, setData] = useState(DEFAULT_ORDER);
    const [spot, setSpot] = useState(true);
    const [loading, setLoading] = useState(false);
    const [symbols, setSymbols] = useState<string[]>([]);

    useEffect(() => {
        getSymbols();
    }, []);


    useEffect(() => {
        console.log(data);

    }, [data]);



    const inputCheck = (): { valid: boolean, reason?: string } => {

        if (data.symbol === '') return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.SYMBOL.EMPTY };


        //Burasi beni baya zorladi ne yalan soyliyim.
        if (data.type === EType.SPOT) {

            if (data.buy_price < data.stop_loss) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.STOP_BUY.SPOT_LT };
            if (!isSorted(data.tp_data, true)) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.TPS.SPOT_INC };
            if (data.buy_price > data.tp_data[0]) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.BUY_PRICE.SPOT_LT };



        } else if (data.type === EType.VADELI) {

            if (data.position === EPosition.LONG) {

                if (data.buy_price < data.stop_loss) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.STOP_BUY.VADELI_LONG_LT };
                if (!isSorted(data.tp_data, true)) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.TPS.VADELI_LONG_INC };
                if (data.buy_price > data.tp_data[0]) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.BUY_PRICE.VADELI_LONG_LT };

            } else if (data.position === EPosition.SHORT) {

                if (data.buy_price > data.stop_loss) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.STOP_BUY.VADELI_SHORT_GT };
                if (!isSorted(data.tp_data, false)) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.TPS.VADELI_SHORT_DEC };
                if (data.buy_price < data.tp_data[0]) return { valid: false, reason: MESSAGES.ERROR.INPUT_CHECK.BUY_PRICE.VADELI_SHORT_GT };

            }
        };

        return { valid: true }
    }





    const getSymbols = async () => {
        setLoading(true);
        fetch(EXPRESS_ENDPOINTS.GET_SYMBOLS).then(values => values.json()).then(values => {
            setSymbols(values);
            setLoading(false);
        });
    }




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


        const check_result = inputCheck();

        if (!check_result.valid) {
            toast.error(check_result.reason);
            return;
        }


        setLoading(true);


        const order_prepared = prepareOrder(data);
        console.log(order_prepared);




        try {

            let result = await fetch(EXPRESS_ENDPOINTS.CREATE_ORDER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(order_prepared)
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

            if (id.includes(TP_PREFIX)) {

                const index = extractTpIndex(id);
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
                    setSpot(parseInt(value) === EType.SPOT);
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

                <FormControl component="fieldset" disabled={spot}>
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
                    defaultValue={''}
                >
                    {symbols.map((symbol: string, index: number) => <MenuItem key={index} value={symbol}>{symbol}</MenuItem>)}
                </Select>
            </FormControl>


            <TextField type="number" onChange={changeHandler} id={FIELD_IDS.BUY_PRICE} label="Alış Fiyatı" variant="outlined" defaultValue={DEFAULT_PRICE} InputProps={{ inputProps: { step: DEFAULT_PRICE } }} />
            <TextField type="number" onChange={changeHandler} id={FIELD_IDS.LEVERAGE} label="Kaldıraç" variant="outlined" defaultValue={1} disabled={spot} />
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
                    <MenuItem value={ECompare.GTE}>{'>='}</MenuItem>
                    <MenuItem value={ECompare.LTE}>{'<='}</MenuItem>
                </Select>
            </FormControl>




            {data.tp_data.map((tp, index) =>
                <TextField sx={{ width: '%100' }} key={index} type="number" onChange={changeHandler} id={FIELD_IDS.TAKE_PROFIT(index)} label={`Take Profit ${index + 1}`} variant="outlined" defaultValue={DEFAULT_PRICE} InputProps={{ inputProps: { step: DEFAULT_PRICE } }} />
            )}


            <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Button color='primary' onClick={addTpHandler} endIcon={<Add />}>Add Take Profit</Button>
                <Button color='secondary' onClick={removeTpHandler} endIcon={<Close />}>Remove Take Profit </Button>
            </Box>

            {data.tp_data.length ?
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
                        <MenuItem value={ECompare.GTE}>{'>='}</MenuItem>
                        <MenuItem value={ECompare.LTE}>{'<='}</MenuItem>
                    </Select>
                </FormControl> : <div></div>}



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
                    <MenuItem value={ECompare.GTE}>{'>='}</MenuItem>
                    <MenuItem value={ECompare.LTE}>{'<='}</MenuItem>
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