import { Backdrop, Button, CircularProgress, Container, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { EType, EPosition, ECompare, TAddOrder_Norm, TAddOrder_Array } from "kriptokrasi-common/types";
import { toast } from 'react-toastify';
import { Box } from "@mui/system";
import CONFIG from 'kriptokrasi-common/config.json';

const FIELD_IDS = {
    SPOT_VADELI_RADIO: 'spot-vadeli-radio',
    LONG_SHORT_RADIO: 'long-short-radio',
    SYMBOL_SELECT: 'symbol-select',
    BUY_PRICE: 'buy-price',
    LEVERAGE: 'leverage',
    BUY_COND: 'buy-condition',
    TAKE_PROFIT: (index: number) => `take-profit-${index}`,
    TP_COND: 'tp-condition',
    STOP_LOSS: 'stop-loss',
    SL_COND: 'sl-condition'
}

const defaultPrice = 0.000001;

var default_data: TAddOrder_Array = {
    position: EPosition.LONG,
    type: EType.SPOT,
    symbol: 'ABCDE',
    buy_price: defaultPrice,
    leverage: 1,
    buy_condition: ECompare.EQ,
    take_profit: [...Array(5).fill(defaultPrice)],
    tp_condition: ECompare.EQ,
    stop_loss: defaultPrice,
    sl_condition: ECompare.EQ,
}

const finalizeData = (data: TAddOrder_Array) => {

    let data_ = { ...data } as any;


    let tps = data_.take_profit;
    delete data_.take_profit;

    let tp_obj = {} as any;
    for (let i = 0; i < tps.length; i++) {
        let label = `take-profit-${i + 1}`;
        tp_obj[label] = tps[i];
    }

    return { id: Date.now(), ...data_, ...tp_obj } as TAddOrder_Norm;
}


export default function AddOrder() {

    const [data, setData] = useState(default_data);
    const [loading, setLoading] = useState(false);

    const createOrder = async () => {

        setLoading(true);

        const data_normalized = finalizeData(data);
        console.log(data_normalized);


        try {

            let result = await fetch(`http://localhost:${CONFIG.network.express_port}/api/v1/create_waiting_order/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data_normalized)
            })


            if (result.status === 200) {
                setLoading(false);
                toast.success('Bekleyen emir eklendi!');
            }

        } catch (error) {
            setLoading(false);
            toast.error(`Bir hata mevcut :(
                ${error}`);
        }

    }



    const changeHandler = (event: any) => {

        const id: string = event.target.id;
        const name = event.target.name;

        const value = parseFloat(event.target.value);


        if (id) {

            if (id.includes('take-profit')) {

                const index = parseInt(id.split('-')[2]);
                var take_profit_ = [...data.take_profit];
                take_profit_[index] = value;
                setData({ ...data, take_profit: take_profit_ });

            } else {

                switch (id) {
                    case FIELD_IDS.BUY_PRICE:
                        setData({ ...data, buy_price: value });
                        break;
                    case FIELD_IDS.LEVERAGE:
                        setData({ ...data, leverage: value });
                        break;
                    case FIELD_IDS.STOP_LOSS:
                        setData({ ...data, stop_loss: value });
                        break;

                }
            }

        } else if (name) {
            switch (name) {
                case FIELD_IDS.SYMBOL_SELECT:
                    setData({ ...data, symbol: value });
                    break;
                case FIELD_IDS.BUY_COND:
                    setData({ ...data, buy_condition: value });
                    break;

                case FIELD_IDS.TP_COND:
                    setData({ ...data, tp_condition: value });
                    break;
                case FIELD_IDS.SL_COND:
                    setData({ ...data, sl_condition: value });
                    break;
                case FIELD_IDS.SPOT_VADELI_RADIO:
                    setData({ ...data, type: value });
                    break;
                case FIELD_IDS.LONG_SHORT_RADIO:
                    setData({ ...data, position: value });
                    break;

            }


        }


    }


    return <Container sx={{
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 4, md: 10 },

    }}
    >
        <Stack spacing={3}>

            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>

                <FormControl component="fieldset">
                    <RadioGroup
                        defaultValue={1}
                        name={FIELD_IDS.SPOT_VADELI_RADIO}
                        id={FIELD_IDS.SPOT_VADELI_RADIO}
                        onChange={changeHandler}
                    >
                        <FormControlLabel value={0} control={<Radio />} label="Spot" />
                        <FormControlLabel value={1} control={<Radio />} label="Vadeli" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset">
                    <RadioGroup
                        defaultValue={1}
                        name={FIELD_IDS.LONG_SHORT_RADIO}
                        id={FIELD_IDS.LONG_SHORT_RADIO}
                        onChange={changeHandler}
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
                    defaultValue={10}
                >
                    <MenuItem value={10}>BTCUSDT</MenuItem>
                    <MenuItem value={20}>BTCPODT</MenuItem>
                    <MenuItem value={30}>ETHUSTD</MenuItem>
                </Select>
            </FormControl>


            <TextField type="number" onChange={changeHandler} id={FIELD_IDS.BUY_PRICE} label="Alış Fiyatı" variant="outlined" defaultValue={defaultPrice} InputProps={{ inputProps: { step: defaultPrice } }} />
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



            {[...Array(5).keys()].map(index =>
                <TextField key={index} type="number" onChange={changeHandler} id={FIELD_IDS.TAKE_PROFIT(index)} label={`Take Profit ${index + 1}`} variant="outlined" defaultValue={defaultPrice} InputProps={{ inputProps: { step: defaultPrice } }} />
            )}

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


            <TextField type="number" id={FIELD_IDS.STOP_LOSS} onChange={changeHandler} label="Stop Loss" variant="outlined" defaultValue={defaultPrice} InputProps={{ inputProps: { step: defaultPrice } }} />


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

    </Container>






}