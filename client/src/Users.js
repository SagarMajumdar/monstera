import React , { useState} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router';
import {io} from 'socket.io-client';

const Users = (props)=>{
    const [searchUserList, setSearchUserList] = useState([]);

    const history = useHistory();

    
    const handleUserSerachTxtChange =async (e)=>{
   
        const monstera_access_token = localStorage.getItem('monstera_access_token');
        try{
            const response = await axios.post('http://localhost:5000/monstera/api/searchUsers',{
                userSearchTxt: e.target.value 
            },{
                headers: {authorization: `Bearer ${monstera_access_token}`}
            });
            setSearchUserList(response.data);
            if( e.target.value == '' ) {
                setSearchUserList([]);        
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
    const sendChannelJoinInvite =async (_id) =>{ 
        const monstera_access_token = localStorage.getItem('monstera_access_token');
        try{
            const response = await axios.post('http://localhost:5000/monstera/api/sendChannelJoinInvite',{
                userId: _id,
                channelId: props.selectedChannel
            },{
                headers: {authorization: `Bearer ${monstera_access_token}`}
            });

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
         <div className="tag is-small is-warning" style={{marginBottom:'10px'}}>search users</div>
            <input style={{marginBottom: '10px'}} className="input is-small" type="text" onChange={handleUserSerachTxtChange}></input>
            <ul className="content">
                { 
                    searchUserList.map((li) => {
                        return(
                            <li className="list" key={li._id}>
                                <span style={{marginRight:'4px'}}>{li.info.name}</span>
                                <button className="button is-small is-success is-outlined is-rounded" onClick={
                                    ()=>{ sendChannelJoinInvite(li._id) ;
                                         const monstera_access_token = localStorage.getItem('monstera_access_token');
                                         var {_id} =JSON.parse( Buffer.from(monstera_access_token.split('.')[1] , 'base64') );
                                         props.socketn.emit('sendjoininvite', {_id:li._id});
                                    } }>send invite</button></li>
                        );
                    })
                } 
            </ul>
        </>
    )
}

export default Users;