import { DataGrid } from '@mui/x-data-grid';
import { Container } from '@mui/material';

const columns = [
    {
        field: 'id',
        headerName: 'ID',
    },
    {
        field: 'firstName',
        headerName: 'Coin',
    },
    {
        field: 'lastName',
        headerName: 'Anlik Fiyat',
    },
    {
        field: 'age',
        headerName: 'Alinacak Fiyat',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'Fark',
        type: 'number',
    },
    {
        field: 'spot',
        headerName: 'Tür',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'Kaldıraç',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'Alış Şartı',
        type: 'number',
    },
    {
        field: 'long',
        headerName: 'Pozisyon',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'TP1',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'TP2',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'TP3',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'TP4',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'TP5',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'TP Şartı',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'SL',
        type: 'number',
    },
    {
        field: 'age',
        headerName: 'SL Şartı',
        type: 'number',
    },

    
    
];

const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];



export default function WaitingOrders() {


    fetch('')


    return <Container sx={{
        p: { xs: 0, md: 10 },
    }}
    >

        <DataGrid
            autoHeight={true}
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick

        />


    </Container>

}