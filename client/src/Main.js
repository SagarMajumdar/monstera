import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import Channels from "./Channels";
import Noti from "./Noti";
import axios from "axios";
import Users from './Users';
import MessageBox from './MessageBox';

import monstera from './assets/monstera.png';

import {io} from 'socket.io-client';

const Main =({socket,socketn}) => {
    
    const history = useHistory();
    const [user, setUser] = useState( null );
    const [token, setToken] = useState( null );
    const [notiOpen, setNotiOpen] = useState(false);
    const [noti, setNoti] = useState([]);
    const [selectedChannel , setSelectedChannel] = useState(null);
    const [newMessage , setNewMessage] = useState('');
    

    const channelsRef = useRef();

    
    useEffect(() => {
         
        socket.on('connect',() =>{        
          
        });

        socketn.on('connect',() =>{        
            
            const monstera_access_token = localStorage.getItem('monstera_access_token');
            if( monstera_access_token != null) {
                var {_id} =JSON.parse( Buffer.from(monstera_access_token.split('.')[1] , 'base64') );
                socketn.emit('join', {_id});  
           }
        });


    },[])

 
    socket.on('sendmessage', (d) => {
       
        console.log(d);
        setNewMessage(d);  
    })

    socketn.on('sendjoininvite', () => {
        console.log('🌶');  
        getNoti();
    })
    

    useEffect(()=>{
        const monstera_access_token = localStorage.getItem('monstera_access_token');
        setToken(monstera_access_token);
        const encodedPayload = monstera_access_token === null ? null :  monstera_access_token.split('.')[1];
        const encodedPayloadb64 = encodedPayload == null ? null : JSON.parse( Buffer.from(encodedPayload, 'base64')) ;// atob is depricated so we are using Buffer.from(str, 'base64')
        if(monstera_access_token) {
            console.log(encodedPayloadb64);
            setUser( encodedPayloadb64 );
        }
        else {
            setUser(null);
            history.push('/monstera/login');
        }
        getNoti();
    },[]);


    const fnCallgetChannels =()=> {
        channelsRef.current.fn_getchannels();
    }
    
    const getNoti =async () => {
        const monstera_access_token = localStorage.getItem('monstera_access_token');
        try {
            const response=await axios.post('http://localhost:5000/monstera/api/getnoti',{},{
                headers: { authorization: `Bearer ${monstera_access_token}` }
            });
         
            setNoti(response.data);     
        }
        catch(err) 
        {
        
            if(err.response.status === 401) 
            {
                localStorage.removeItem('monstera_access_token');
                history.push('/monstera/login');
            }
        }
    }

    return (
        <>
            <nav className="navbar is-spaced" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <div className="columns  is-vcentered" >
                        <div  className="column "> <img src={monstera}  style={{width: '64px'}}/> </div>
                        <div className="column is-7"><h5 className="title is-5">monstera</h5></div>
                    </div>
                </div>
              
                <div className="navbar-menu">
                    <div className="navbar-end">
                    <div className="navbar-item">
                        {user &&  <>hello {user.info.name}</>}
                        <div style={{marginLeft:'10px',cursor:'pointer'}} onClick={
                                    ()=>{ setNotiOpen((prev) => {return !prev }  );
                                          getNoti();  
                                        }
                            }>
                                <span className="tag is-danger">
                                    notification
                                </span>
                        </div>
                        <div style={{marginLeft:'5px'}}>
                            <button className="button is-small is-outlined is-dark"
                                onClick={()=>{
                                    localStorage.removeItem('monstera-access-token');   
                                    history.push('/monstera/login');
                                }}>logout</button>
                        </div>
                    </div>  
                    </div>
                </div>
            </nav>



            <div className="container is-fluid" style={{marginTop:'25px'}}>
                <div className="columns">
                    <div  className="column is-one-fifth" >
                        {user &&
                            <>
                                <Channels 
                                  
                                    socket={socket} ref={channelsRef} 
                                    setSelectedChannel={setSelectedChannel} 
                                    selectedChannel={selectedChannel} ></Channels>
                            
                            </>
                        }
                    </div>
                    <div  className="column is-one-fifth">
                        {/* <div>{selectedChannel}</div> */}
                        <Users  selectedChannel={selectedChannel} socketn={socketn}></Users>
                    </div>
                    <div className="column">
                        {
                          
                            <>
                               {selectedChannel == null &&
                                <p><span className="tag is-info">i</span> create and select any channel. 
                                Then you can start your conversation in that channel. </p>
                               }
                            {selectedChannel != null &&
                            <MessageBox socket={socket} selectedChannel={selectedChannel} newMessage={newMessage}></MessageBox> }
                            </>
                        }
                    </div>
                    {notiOpen &&
                    <div className="column is-one-fifth">
                        <Noti  
                        noti={noti} getNoti={getNoti} fnCallgetChannels={fnCallgetChannels}>  </Noti>
                    </div>
                    }
                </div>
            </div>



        </>
    );
};

export {Main};