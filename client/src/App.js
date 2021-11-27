import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route , Switch } from 'react-router-dom';
import { Login } from './Login';
import { Main } from './Main';
import 'bulma/css/bulma.css';
import {io} from 'socket.io-client';

 function App() {

  const [socket ] = useState(()=> { return io.connect('http://localhost:5000/msg') }) ;
  const [socketn ] = useState(()=> { return io.connect('http://localhost:5000/noti') }) ;

  return (
   <>
      <BrowserRouter>
        <Switch>
          <Route path="/monstera/login" exact>
            <Login></Login>
          </Route>
          <Route path="/monstera/main" exact>
            <Main socket={socket} socketn={socketn}></Main>
          </Route>
        </Switch>      
      </BrowserRouter>
   </>
  );
}

export default App;
