import { Backdrop, Button, CircularProgress, Container, Stack, Switch, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { TTMessage } from "../../kriptokrasi-common/message_types";
import { EXPRESS_ENDPOINTS } from "../../utils/endpoint_manager";
import { MESSAGES } from "../../utils/messages";


export default function SendMessage() {

    const [data, setData] = useState<TTMessage>({ vip: true, filter: true, message: '',lang:'TR' });
    const [filterEnabled, setFilterEnabled] = useState(true);
    const [sendEnabled, setSendEnabled] = useState(false);
    const [loading, setLoading] = useState(false);


    const onVipChange = (event: any, checked: boolean) => {
        setFilterEnabled(checked);
        setData({ ...data, vip: checked });
    }

    const onFilterChange = (event: any, checked: boolean) => {
        setData({ ...data, filter: checked });
    }

    const onLangChange = (event: any, checked: boolean) => {
        let lang = checked ? "EN" : "TR";
        setData({ ...data, lang: lang });
    }

    const onMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const message = event.target.value;
        setSendEnabled(message.trim().length > 0);
        setData({ ...data, message: message });
    }

    const onMessageSend = async () => {

        setLoading(true);

        try {

            const result = await fetch(EXPRESS_ENDPOINTS.SEND_TELEGRAM_MESSAGE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })


            if (result.status === 200) {
                setLoading(false);
                setData({ ...data, message: '' });
                toast.success(MESSAGES.SUCCESS.MESSAGE.SEND);
            } else {
                setLoading(false);
                toast.error(MESSAGES.ERROR.MESSAGE.SEND);
            }


        } catch (error: any) {
            setLoading(false);
            toast.error(error.message);
        }


    }

    return <Container maxWidth="md" sx={{
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 4, md: 10 },

    }}>

        <Stack spacing={2}>

            <Stack direction="row" spacing={1} alignItems="center">
                <Typography>Herkes</Typography>
                <Switch defaultChecked onChange={onVipChange} />
                <Typography>Sadece VIP</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
                <Typography>Tum VIP</Typography>
                <Switch defaultChecked onChange={onFilterChange} disabled={!filterEnabled} />
                <Typography>Aktif VIP</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
                <Typography>TR</Typography>
                <Switch defaultChecked onChange={onLangChange} />
                <Typography>EN</Typography>
            </Stack>

            <TextField
                id="send-telegram-message-textfiedl"
                label="Message"
                multiline
                rows={10}
                placeholder='Mesajinizi giriniz...'
                onChange={onMessageChange}
                value={data.message}
            />

            <Button variant="contained" onClick={onMessageSend} disabled={!sendEnabled}>Mesaj G??nder</Button>

        </Stack>


        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        >
            <CircularProgress size={60} color="inherit" />
        </Backdrop>


    </Container>


}