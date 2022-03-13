import { Button, Container, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import ENDPOINTS from "../../kriptokrasi-common/endpoints";
import { EXPRESS_ENDPOINTS } from "../../utils/endpoint_manager";


export default function DevTools() {

    const [values, setValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [symbol, setSymbol] = useState('');


    const onSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSymbol(event.target.value);
    }

    const onChange = (value: string, index: number) => {

        let values_ = values.slice();
        values_[index] = parseFloat(value);
        setValues(values_);
    }

    const onClick = (id: number) => {

        fetch(EXPRESS_ENDPOINTS.DEV_LIVE_PRICE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symbol: symbol, bidPrice: values[id], wsMarket: 'spot' })
        });

    }


    return <Container maxWidth="md" sx={{
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 4, md: 10 },

    }}>


        <Stack spacing={3} >

            <Typography variant="h4">Momentary Price generator</Typography>

            <TextField label='Symbol' onChange={onSymbolChange}></TextField>


            {values.map((value, index) => {

                return <Stack direction='row' alignItems='center' justifyContent='space-between'>
                    <TextField id={'text_field_' + index} onChange={(event) => onChange(event.target.value, index)} />
                    <Button onClick={() => onClick(index)}>Send</Button>
                </Stack>

            })}


        </Stack>





    </Container >




}