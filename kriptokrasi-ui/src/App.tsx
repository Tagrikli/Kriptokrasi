import './App.css';
import Drawer from './components/Drawer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'
import { Box } from '@mui/system';
import { useState } from 'react';
import MenuRenderer from './components/MenuRenderer';

import './utils/endpoint_manager'
import Login from './components/Login';

function App() {

  const [menu, setMenu] = useState(-1);


  const menuSelection = (index: number) => {
    setMenu(index);
  }

  const onLogin = async (data: any) => {

    console.log(data);

    return new Promise<void>((res, rej) => {
      setTimeout(() => res(), 1000);
    })

  }

  return (

    <Box sx={{ width: '%100' }} className="App">

      <Login onLogin={onLogin}></Login>

      {/* <Drawer onSelect={menuSelection}></Drawer>
      <MenuRenderer index={menu}></MenuRenderer> */}

      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        draggablePercent={50}
        pauseOnFocusLoss={false}
        draggable
      />


    </Box>
  );
}

export default App;
