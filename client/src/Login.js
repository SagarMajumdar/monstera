import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router';
import axios from 'axios';
import monstera from './assets/monstera.png';
export const Login = ({fn}) =>{

    const [emailVal, setEmailVal] = useState("");
    const [pwdVal, setPwdVal] = useState("");
    const [rePwdVal, setRePwdVal] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [isLogin, setIsLogin]=useState(true);
    const [nameVal, setNameVal] = useState("");
    const [bioVal ,setBioVal] = useState("");

    const history =useHistory();

    useEffect(() => {
      //call api with token it it exists and redirect to main page if ok
    }, []);

    const submitLoginFormHandler = async (e)=>{
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/monstera/api/login' , { email:emailVal,password:pwdVal});
            const {monsteratoken} = response.data;
            localStorage.setItem('monstera_access_token', monsteratoken);
            history.push('/monstera/main');   
        }
        catch(err) {
             setErrMsg(err.response.statusText);
        }
    
    }
    const toggleLoginFormHandler = () =>{ 
        setErrMsg(""); 
        setIsLogin(prev => !prev);    
    }
    const submitSignupFormHandler= async(e) =>{
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/monstera/api/signup' , { email:emailVal,password:pwdVal, info : { nameVal, bioVal}});
            const {monsteratoken} = response.data;
            localStorage.setItem('monstera_access_token', monsteratoken);
            history.push('/monstera/main');    
        }
        catch(err)
        {
            setErrMsg(err.response.statusText);
        }
    }

    return (
        <>
      
     
            <div className="columns " >
                <div  className="column is-1" >
                </div>
                <div className="column is-2" style={{marginTop:'10px', minHeight:'100vh'}}>
                    <div className="columns is-vcentered">
                        <div className="column is-half">
                            <img src={monstera} alt="app logo" ></img>
                        </div>
                        <div className="column ">
                            <h6 className="is-6 title">monstera</h6>
                        </div>
                    </div>

                    { isLogin ?
                            <>
                                <div className="tag is-warning is-small">login</div>
                                <form onSubmit={submitLoginFormHandler}>
                                    <div className="field">
                                        <label htmlFor="email" className="label is-small">email</label> 
                                        <input value={emailVal} onChange={(e) => { setEmailVal(e.target.value) }} id="email" type="text" className="input is-small"/>
                                    </div>
                                    <div className="field">
                                        <label htmlFor="password" className="label is-small">password</label> 
                                        <input id="password" value={pwdVal} onChange={(e) => { setPwdVal(e.target.value) }} type="password"  className="input is-small" />
                                    </div>
                                    <div className="field">
                                        <div className="control">
                                            <button className="button is-success is-small" type="submit" disabled={emailVal === "" || pwdVal ===""}>login</button>
                                        </div>
                                    </div>
                                </form>
                            </>
                            :
                            <>
                                <div className="tag is-warning is-small">signup</div>
                                 <form onSubmit={submitSignupFormHandler}>
                                    <div className="field">
                                        <label  className="label is-small" htmlFor="name">name</label>
                                        <input  className="input is-small" value={nameVal} onChange={(e) => { setNameVal(e.target.value)}} type="text" id="name" />
                                    </div>

                                    <div className="field">
                                        <label className="label is-small"  htmlFor="bio">bio</label>
                                        <textarea  rows="2" className="textarea is-small" value={bioVal}  onChange={(e) => { setBioVal(e.target.value)}}  id="bio" ></textarea>
                                    </div>

                                    <div  className="field">
                                        <label  className="label is-small"  htmlFor="email">email</label> 
                                        <input  className="input is-small" value={emailVal} onChange={(e) => { setEmailVal(e.target.value) }} id="email" type="text" />
                                    </div>

                                    <div  className="field">
                                        <label  className="label is-small"  htmlFor="password">password</label> 
                                        <input   className="input is-small"  id="password" value={pwdVal} onChange={(e) => { setPwdVal(e.target.value) }} type="password" />
                                    </div>

                                    <div  className="field">
                                        <label  className="label is-small"  htmlFor="repassword">confirm password</label> 
                                        <input className="input is-small" id="repassword" value={rePwdVal} onChange={(e) => { setRePwdVal(e.target.value) }} type="password" />
                                    </div>

                                    <div className="field">
                                        <div className="control">
                                            <button className="button is-success is-small" type="submit" disabled={emailVal === "" || pwdVal ==="" || rePwdVal ==="" || pwdVal !== rePwdVal }>signup</button>        
                                        </div>
                                    </div>
                                          
                                </form>
                            </>
                        }
                        <button style={{display: 'block',marginTop: '10px', marginBottom:'20px'}}  className="button is-small is-outlined" type="button" onClick={toggleLoginFormHandler}> { !isLogin ? 'login' : 'sign up'}</button>
                        {errMsg !="" &&
                        <div className="tag is-small is-warning">{errMsg}</div> }
                        <div style={{border:'1px solid #ddd', borderRadius:'5px', padding:'5px',marginTop: '25px'}} className="content is-small" >
                            <p><span className="tag is-info">i</span> built using react js, node js , socket io, mongodb and bulma. </p>      
                            <div>Icons made by <a href="https://www.flaticon.com/authors/icongeek26" title="Icongeek26">Icongeek26</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                        </div>

                </div>
                <div  className="column" ></div>
            </div>  

           
        </>
    )
};