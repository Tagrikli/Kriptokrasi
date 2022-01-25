import './App.css';
import Drawer from './components/Drawer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'
import { Box } from '@mui/system';
import { useState } from 'react';
import MenuRenderer from './components/MenuRenderer';

import './utils/endpoint_manager'
import Login from './components/Login';
import { EXPRESS_ENDPOINTS } from './utils/endpoint_manager';
import { MESSAGES } from './utils/messages';

function App() {

  const [menu, setMenu] = useState(-1);
  const [loggedIn, setLoggedIn] = useState(false);

  const menuSelection = (index: number) => {
    setMenu(index);
  }


  const onLogin = async (data: any) => {


    let result = await fetch(EXPRESS_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { 'Content-Type': "application/json"},
      body: JSON.stringify(data)
    })

    if (result.status === 200) {
      setLoggedIn(true);
    } else {
      toast.error(MESSAGES.ERROR.LOGIN);
    }



  }


  if (!loggedIn) {

    return <div><Login onLogin={onLogin}></Login>
    
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
    
    
    </div>

  }
  else {

    return (

      <Box sx={{ width: '%100' }} className="App">


        <Drawer onSelect={menuSelection}></Drawer>
        <MenuRenderer index={menu}></MenuRenderer>

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
}

export default App;
