import React  from 'react';
import axios from 'axios';
import { useHistory } from 'react-router';

const Noti=(props)=>{
    const history = useHistory();

    const handleDiscardNoti = async (n)=>{
        if(n != null) {
        
            const monstera_access_token = localStorage.getItem('monstera_access_token');
            try {
                const response = await axios.post('http://localhost:5000/monstera/api/discardnoti',
                {
                    ...n
                },{
                    headers: { authorization: `Bearer ${monstera_access_token}` }
                });
                console.log(JSON.stringify(response.data));
                props.getNoti();
            }
            catch(err) {
                if(err.response.status === 401) 
                {
                    localStorage.removeItem('monstera_access_token');
                    history.push('/monstera/login');
                }
            }   
            
        }
    }
    const handleOkNoti = async (n)=>{
      
        if(n != null) {
            if(n.type === 'channel_join_invite') 
            {
                const monstera_access_token = localStorage.getItem('monstera_access_token');
                try {
                    const response = await axios.post('http://localhost:5000/monstera/api/accepctjoininvite',
                    {
                        ...n
                    },{
                        headers: { authorization: `Bearer ${monstera_access_token}` }
                    });
                  
                   props.getNoti();
                   props.fnCallgetChannels();

                  //  props.socket.emit('reloadChUsrLi',{channelId:n.channelId});
                }
                catch(err) {
                    if(err.response.status === 401) 
                    {
                        localStorage.removeItem('monstera_access_token');
                        history.push('/monstera/login');
                    }
                 }   
            }
        }
    }

    return (
        <>
            {
                props.noti.map((n)=>{
                    return (
                        <div style={{marginBottom:'5px'}} key={n._id}>
                                <div>{n.message}</div>
                                <div style={{marginTop:'4px'}}>
                                    <button style={{marginRight:'4px'}} className="button is-small " type="button" onClick={()=>handleOkNoti(n)}>accept</button>
                                    <button  className="button  is-small"  type="button"  onClick={()=>handleDiscardNoti(n)}>discard</button>
                                </div>
                            </div>
                    )
                })
            }
        </>
    );
}

export default Noti;