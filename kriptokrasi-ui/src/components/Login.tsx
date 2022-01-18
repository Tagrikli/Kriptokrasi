import { Backdrop, Button, Card, CardContent, CardHeader, CardMedia, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, FormGroup, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { AccountCircle, Lock } from "@mui/icons-material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Login(props: { onLogin: (login_data: any) => Promise<void> }) {



    const [data, setData] = useState({ username: '', password: '', remember: false });
    const [loading, setLoading] = useState(false);


    const usernameChange = (event: any) => {
        setData({ ...data, username: event.target.value.trim() });
    }

    const passwordChange = (event: any) => {
        setData({ ...data, password: event.target.value.trim() });
    }
    const rememberChange = (event: any) => {
        setData({ ...data, remember: event.target.checked });
    }

    const onSubmit = async () => {

        const ul = data.username.length;
        const pl = data.password.length;

        if (ul && pl) {
            setLoading(true);
            await props.onLogin(data);
            setLoading(false);
        }



    }

    return <Container maxWidth="md" sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 4, md: 20 },

    }}
    >


        <Paper elevation={24} sx={{ p: 5, borderRadius: 4 }}>


            <FormControl>
                <Stack spacing={3}>
                    <Typography gutterBottom variant="h5" component="div">
                        Kriptokrasi Giris Paneli
                    </Typography>


                    < Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <AccountCircle sx={{ color: 'action.active', mr: 2, my: 1 }} />
                        <TextField  value={data.username} onChange={usernameChange} id="username" label="Kullanici Adi" type='text' variant="standard" />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Lock sx={{ color: 'action.active', mr: 2, my: 1 }} />
                        <TextField  onChange={passwordChange} value={data.password} id="password" label="Sifre" type='password' variant="standard" />
                    </Box>


                    <FormGroup>
                        <FormControlLabel control={<Checkbox onChange={rememberChange} />} label="Beni Hatirla" />
                    </FormGroup>

                    <Button variant="contained" onClick={onSubmit}>Login</Button>



                </Stack>

            </FormControl>

        </Paper>

        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
        >
            <CircularProgress size={60} color="inherit" />
        </Backdrop>

    </Container >







}