import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import HistoryIcon from '@mui/icons-material/History';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import { Box, SwipeableDrawer } from '@mui/material';
import MenuBar from './MenuBar';
import React, { useState } from 'react';




export default function Drawer(props: { onSelect: (index: number) => void }) {
    const [active, setActive] = useState(false);
    const [dev, setDev] = useState(false);

    const icons = [<AddIcon />, <AccessTimeIcon />, <AlarmOnIcon />, <HistoryIcon />, <EmailIcon />, <GroupIcon />, <BuildIcon />]

    const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
        setActive(!active);
    };

    const onDev = (event: any, selection: boolean) => {
        setDev(selection);
    }

    const menuItemClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
        const menu_index = parseInt(event.currentTarget.id.split('-')[2]);
        props.onSelect(menu_index);
    }

    const list = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer}
            onKeyDown={toggleDrawer}
        >
            <List>
                {['Bekleyen Emir Ekle', 'Bekleyen Emirler', 'Aktif Emirler', 'İşlem Geçmişi', 'Mesaj Gönder', 'VIP Ayarla'].map((text, index) => (
                    <ListItem button onClick={menuItemClickHandler} id={`menu-item-${index}`} key={text}>
                        <ListItemIcon>
                            {icons[index]}
                        </ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}

                {dev ? <ListItem button onClick={menuItemClickHandler} id={`menu-item-${6}`} key={'Dev Tools'}>
                    <ListItemIcon>
                        {icons[6]}
                    </ListItemIcon>
                    <ListItemText primary={'Dev Tools'} />
                </ListItem> : ''}


            </List>
            <Divider />
        </Box>
    );

    return (
        <Box>
            <React.Fragment>
                <MenuBar open={() => setActive(true)} onDev={onDev}></MenuBar>
                <SwipeableDrawer
                    open={active}
                    onClose={toggleDrawer}
                    onOpen={toggleDrawer}
                >
                    {list()}
                </SwipeableDrawer>
            </React.Fragment>
        </Box>
    );
}