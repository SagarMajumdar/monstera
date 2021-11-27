import React, {  forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router';
import ChannelList from './ChannelList';

const Channels = forwardRef((props,ref) => {


    const [channelName,setChannelName] = useState("");
    const [channelBio,setChannelBio] = useState("");
    const [channelList,setChannelList] = useState([]);

    const history = useHistory();

    

    useEffect(()=>{
        getChannelList();
    }, []);

    
    useImperativeHandle(
        ref,
        ()=>({
            fn_getchannels() {
                getChannelList();
            }
        })
    )

    const getChannelList = async () => {
        const monstera_access_token = localStorage.getItem('monstera_access_token');
        try {
            const response = await axios.post('http://localhost:5000/monstera/api/getChannels',
                {},{
                    headers: { authorization: `Bearer ${monstera_access_token}` }
                });
            setChannelList(response.data);
        }
        catch(err) {
      
            if(err.response.status === 401) 
            {
                localStorage.removeItem('monstera_access_token');
                history.push('/monstera/login');
            }
        }
    }
    
    const addChannelHandler = async ()=>{
        const monstera_access_token = localStorage.getItem('monstera_access_token');
       
        try {
            const response=await axios.post('http://localhost:5000/monstera/api/addchannel',{
                channelName,
                channelBio
            },{
                headers: { authorization: `Bearer ${monstera_access_token}` }
            });
            getChannelList();
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
        <div className="tag is-small is-warning">add channel</div>
      
            <div style={{marginTop:'10px' ,marginBottom:'10px',paddingBottom:'10px', borderBottom:'1px solid #ddd'}}>
                <div className="field">
                 
                    <div className="control">
                        <input  placeholder="Enter Channel Name .Eg. Avocado Place" type="text" value={channelName} onChange={(e)=>{ setChannelName(e.target.value) }} className="input is-small"></input>
                    </div>
                </div>
                    <div className="field">
                    <div className="control">
                        <textarea placeholder="Enter Channel Bio .Eg. a channel for all things avocado 🥑" value={channelBio}  onChange={(e)=>{ setChannelBio(e.target.value) }}   className="textarea is-small"></textarea>
                    </div>
                </div>
                <div className="control">
                <button className="button is-success is-rounded is-small" type="button" onClick={addChannelHandler} 
                        disabled = {channelName.trim() === '' || channelBio.trim() === '' }>add channel</button>
                </div>
            </div>
        


        <ChannelList socket={props.socket} chl={channelList} currChannel ={props.selectedChannel} 
        setCurrChannel={props.setSelectedChannel}  ></ChannelList>

       
        </>
    );
});

export default Channels;