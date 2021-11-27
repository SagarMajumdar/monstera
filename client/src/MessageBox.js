import React, { useEffect, useState }  from "react";
import { useHistory } from 'react-router';
import axios from 'axios';

const MessageBox = (props) => {
    const [messagetxt, setMessagetxt] = useState("");
    const [messagetxtarr , setMessagetxtarr] = useState([]);

    const history = useHistory();

    const getMessages = async()=>{
         const monstera_access_token = localStorage.getItem('monstera_access_token');
        try {
          
            const response = await axios.post('http://localhost:5000/monstera/api/getmessages',
                { channelId:  props.selectedChannel},{
                    headers: { authorization: `Bearer ${monstera_access_token}` }
                });
            setMessagetxtarr(response.data);
            
        }
        catch(err) {
      
            if(err.response.status === 401) 
            {
                localStorage.removeItem('monstera_access_token');
                history.push('/monstera/login');
            }
        }
    }

    useEffect(()=>{
        
        getMessages();
    }, [props.selectedChannel]);
    
    useEffect(()=>{
        console.log('🍍')
        if(props.newMessage.channelId == props.selectedChannel) {     
            setMessagetxtarr(p=>{
                return [...p, {datesent:props.newMessage.senton , messagesentby: props.newMessage.sentby ,messagetxt : props.newMessage.messagetxt}]
            });    
        }
    },[props.newMessage])

    const handleMessageSend = async () => {
        const monstera_access_token = localStorage.getItem('monstera_access_token');
        try {
            if(messagetxt.trim()  !==  "") {
                const response = await axios.post('http://localhost:5000/monstera/api/sendmessage',
                    { messagetxt: messagetxt,  channelId:  props.selectedChannel},{
                        headers: { authorization: `Bearer ${monstera_access_token}` }
                    });
          
                    
                let {_id,info } = JSON.parse( Buffer.from(monstera_access_token.split('.')[1] , 'base64') );
                props.socket.emit('sendmessage',  
                    {  messagetxt: messagetxt,  channelId:   props.selectedChannel , sentby: info.name,  senton:  new Date() , messagesentby : _id});
              
            }
        }
        catch(err) {
            if(err.response.status === 401) 
            {
                localStorage.removeItem('monstera_access_token');
                history.push('/monstera/login');
            }
        }
    }
    return ( 
    <>  
            <>
                { 
                messagetxtarr.map((m, i) => {
                    return (
                        <div  key={i} style={{marginBottom:'10px'}}>
                            <span className="tag is-small">{m.datesent != undefined && m.datesent != undefined != null  ?
                            new Date( m.datesent ).getDate().toString() + '-' +
                            new Date( m.datesent ).getMonth().toString() + '-' + 
                            new Date( m.datesent ).getFullYear().toString() + ' '  + 
                            new Date( m.datesent ).getHours().toString() + ':' +
                             new Date( m.datesent ).getMinutes().toString()  
                             : ''} </span>
                       
                            <span className="tag is-small is-warning"> {  m.usdata != undefined && m.usdata !=  null ?  m.usdata[0].info.name :  m.messagesentby} </span>
                            <div style={{marginTop:'1px'}} >  {m.messagetxt}  </div>
                         
                        </div>
                    )
                })
                }
            </>
            <div className="columns">
                <div className="column is-10">
                    <textarea rows="1" className="textarea" value={messagetxt} onChange={(e)=>{ setMessagetxt(e.target.value) }}></textarea>
                </div>
                <div className="column">
                    <button className="button is-small is-success is-rounded" onClick={handleMessageSend}>send</button>
                </div>
            </div>
    </>
    )
}

export default MessageBox;