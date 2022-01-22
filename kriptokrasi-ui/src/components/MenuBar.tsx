import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';

export default function MenuBar(props: { open: () => void, onDev: (event: any, selection: boolean) => void }) {
    return (
        <Box sx={{ flexGrow: 1 }}>

            <AppBar position="static" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => props.open()}
                    >
                        <MenuIcon />

                    </IconButton>
                    <Typography variant="h6" component="div" >
                        Kriptokrasi Admin Paneli
                    </Typography>


                </Toolbar>
                <Switch sx={{ m: 2 }} onChange={props.onDev}></Switch>
            </AppBar>
        </Box >
    );
}
