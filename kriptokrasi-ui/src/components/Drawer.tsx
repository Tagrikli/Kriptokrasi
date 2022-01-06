import * as React from 'react';
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
import { Box, SwipeableDrawer } from '@mui/material';
import MenuBar from './MenuBar';




export default function Drawer(props: { onSelect: (index: number) => void }) {
    const [active, setActive] = React.useState(false);

    const icons = [<AddIcon />, <AccessTimeIcon />, <AlarmOnIcon />, <HistoryIcon />, <EmailIcon />]

    const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
        console.log(event);
        setActive(!active);
    };

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
                {['Bekleyen Emir Ekle', 'Bekleyen Emirler', 'Aktif Emirler', 'İşlem Geçmişi', 'Mesaj Gönder'].map((text, index) => (
                    <ListItem button onClick={menuItemClickHandler} id={`menu-item-${index}`} key={text}>
                        <ListItemIcon>
                            {icons[index]}
                        </ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>
            <Divider />
        </Box>
    );

    return (
        <Box>
            <React.Fragment>
                <MenuBar open={() => setActive(true)}></MenuBar>
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