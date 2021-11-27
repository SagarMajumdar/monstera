import React,{useState} from 'react';
import axios from "axios";
import { useHistory } from "react-router";

const ChannelList =  ({currChannel, chl=[],setCurrChannel,socket})=>{
    
    const [currChannelUsers, setCurrChannelUsers] = useState([]);

    const history = useHistory();
    const styleChLiSelected = {
        padding: '4px',
        borderRadius: '5px',
        cursor: 'pointer',
        margin:'4px',
        backgroundColor: '#48c78e',
        color: 'white'
    };
    const styleChLi= {
    
        padding: '4px',
        cursor: 'point  er',
        margin:'4px'
    };

    const getChannelUsers = async (chid)=>{
        const monstera_access_token = localStorage.getItem('monstera_access_token');
        try {
            const response=await axios.post('http://localhost:5000/monstera/api/getchannelusers',
                {currChannel:chid},
                {headers: { authorization: `Bearer ${monstera_access_token}` }
            });
            setCurrChannelUsers(response.data);
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

    // socket.on('reloadChUsrLi', (d) => {
    //     if(currChannel == d.channelId) {
    //         getChannelUsers(d.channelId);
    //     }
    // });

    return (
        <>
            {
                <div>
                <div className="tag is-warning">
                    Your Channels
                </div>
                    <ul className="content">              
                        { chl.map((ch)=>{
                            return  (
                                ch.chdata.map((c)=>{
                                    
                                        return (
                                            <li key={c._id} onClick={() => { 
                                                    setCurrChannel( (prev)=> {
                                                        socket.emit('join', {channelId: c._id});  
                                                        return c._id;  
                                                    });
                                                    getChannelUsers(c._id);
                                                }} 
                                                 >
                                                    <div style={currChannel == c._id ? styleChLiSelected :  styleChLi} >{c.channelName}</div>
                                                    { currChannel == c._id  &&
                                                        <ul  style= {{listStyleType:'none', fontSize:'smaller'}} >
                                                            {
                                                                currChannelUsers.map((u) =>{
                                                                    return (
                                                                            u.userdata.map((ud) => {
                                                                                return(
                                                                                    <li key={ud._id}>
                                                                                        <div>
                                                                                            {ud.info.name}
                                                                                        </div>
                                                                                    </li>
                                                                                )
                                                                            })
                                                                        )
                                                                })
                                                            }
                                                        </ul> 
                                                    }   
                                            </li>
                                        );
                                }) 
                            )
                    }) }
                    </ul>
                </div>
            }


        </>
    );
}

export default ChannelList;