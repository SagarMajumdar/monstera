const express = require('express');
const mongoConnect = require('./util/database').mongoConnect;
const getDb =  require('./util/database').getDb;
const bcrypt =  require('bcrypt');
const jwt = require( 'jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const socket = require('socket.io');

require('dotenv').config();

const app = express();
app.use(express.json());

var corsOptions = {
    origin: 'http://localhost:3000',
    credentials:true
};
app.use(cors(corsOptions));

var port = 5000;


mongoConnect( () => {
        
    let server = null;
    let io = null;

    server = app.listen(port, ()=>{ 
        console.log(`server is running on port ${port}`) 
    });
    
    io =  socket(server, {
        cors: {
          origin: "http://localhost:3000"
        }
      });

    // creating socket io namespace
    const msg = io.of('/msg');
    const noti = io.of('/noti');

     msg.on('connection',(socket) => {
        console.log('user connected');
        const so = socket;

        so.on('join', function(d) {
            so.join(d.channelId);     
         }
        );

        
        so.on('disconnect',(d) =>{
             console.log('disconnected 🍈');
         });

        so.on('sendmessage', (d) => {
            console.log('🥗', d)
            msg.to(d.channelId).emit('sendmessage' , { messagetxt: d.messagetxt, sentby: d.sentby,  senton: d.senton, messagesentby:   d.messagesentby, channelId: d.channelId  });
        });

        // so.on('reloadChUsrLi', (d)=>{
        //     msg.to(d.channelId).emit('reloadChUsrLi', { channelId:d.channelId });
        // });

    });
    
    noti.on('connection',(socket) => {
        const so = socket;
        so.on('join', function(d) {
            so.join(d._id);     
         }
        );
        
        so.on('disconnect',(d) =>{
             console.log('disconnected 🍚');
        });

        so.on('sendjoininvite', (d) => {
            console.log('🍧', d)
            noti.to(d._id).emit('sendjoininvite');
        });
       
    });



});

app.post('/monstera/api/signup', async (req, res)=>{
    const {email, password, info} = req.body;
    const db = getDb();
    const user =await db.collection('users').findOne({email});
    if(user) {
        res.statusMessage='user already exists';
        return res.status(409).json();  // 409 - conflict
    }
    const passwordHash= await bcrypt.hash(password, 10);
   
    const {nameVal:name, bioVal:bio} = info;

    const result = await db.collection('users').insertOne({
        email,
        passwordHash,
        info: {name, bio},
        isVerified: false
    });

    const {insertedId} = result;

    jwt.sign({
        _id: insertedId,
        email,
        info: {name, bio},
        isVerified: false
    },
    process.env.monstera_USER_SECRET,
    {
        expiresIn: '1h'
    },
    (err, token)=>{
        if(err) {
            return res.status(500).json({err});
        }
        else{
            return res.status(200).json({monsteratoken:token});
        }
    }
    )
});

app.post('/monstera/api/login', async(req, res)=>{
    const {email , password}= req.body;
    const db=getDb();
    const user = await db.collection('users').findOne({email});
    if(!user)
    {
        res.statusMessage='user not found';
        return  res.status(401).json(); // 401 - unauthorized
    }

    const { _id,isVerified,passwordHash,info } = user;
    const isCorrect=await bcrypt.compare(password,passwordHash);
    if(isCorrect) {
        jwt.sign(
            {_id,email, info,isVerified},
            process.env.monstera_USER_SECRET,
            {expiresIn: '1h'},
            (err,token)=>{
                if(err) {
                    return res.status(500).json({err});
                }
                else
                {
                    return res.status(200).json({monsteratoken:token});
                }
            })
    }
    else {
        res.statusMessage='user credentials not correct';
        return res.status(401).json();
    }

});

app.post('/monstera/api/addchannel', async (req,res)=>{
    const {authorization}=req.headers;
    const {channelName, channelBio} = req.body;
    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else{
        const token= authorization.split(' ')[1];

        const {_id} =  JSON.parse( Buffer.from(token.split('.')[1] , 'base64') )  ;

        jwt.verify(token,process.env.monstera_USER_SECRET,async (err, decoded) =>{
            if(err) {

                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else{
                const db=getDb();
                let o_id_createdBy = new ObjectId(_id);

                const result= await db.collection('channels').insertOne({
                    channelName,
                    channelBio ,
                    createdBy:o_id_createdBy
                });

                let query = {userId: o_id_createdBy, channelId:result.insertedId } ;
                const insert_map_result = await db.collection('user_channel_map').insertOne(query);

                return  res.status(200).json({acknowledged:result.acknowledged, insertedId:result.insertedId, channelName});
            }
        })
    }


});


app.post('/monstera/api/getchannelusers', async (req,res)=>{
    const {authorization}=req.headers;
    const {currChannel} = req.body;
    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else{
        const token= authorization.split(' ')[1];
        const {_id} =  JSON.parse( Buffer.from(token.split('.')[1] , 'base64') )  ;
        jwt.verify(token,process.env.monstera_USER_SECRET,async (err, decoded) =>{
            if(err) {
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else{
                const db=getDb();
                let channel_o_id = new ObjectId(currChannel);
             
                const result = await db.collection('user_channel_map').aggregate([
                    {$match : { channelId: channel_o_id  }},
                    {
                        $lookup:{
                            from: 'channels',
                            localField: 'channelId',
                            foreignField: '_id',
                            as: 'channeldata'
                        }
                    },
                    {
                        $lookup:{
                            from: 'users',
                            localField:'userId',
                            foreignField: '_id',
                            as: 'userdata'
                        }
                    }
                ]).toArray();

            

                return  res.status(200).json(result);
            }
        })
    }


});


app.post('/monstera/api/getChannels', async (req, res) =>
{
    const {authorization} = req.headers;
    if(!authorization)
    {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else {
        const token = authorization.split(' ')[1];
        var {_id} =  JSON.parse( Buffer.from(token.split('.')[1] , 'base64') )  ;

        jwt.verify(token, process.env.monstera_USER_SECRET, async (err, decoded) =>{
            if( err ){
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();

                let o_id_createdBy = new ObjectId(_id);
                
                const result = await db.collection('user_channel_map').aggregate([
                    {$match: { userId: o_id_createdBy }},
                    {
                        $lookup: {
                            from: 'channels',
                            localField: 'channelId',
                            foreignField: '_id',
                            as: "chdata"
                        }
                    }
                ]).toArray();

            

                return  res.status(200).json(result);

            }
        })
    }

});

app.post('/monstera/api/searchUsers', async(req, res) => {
    const {authorization } = req.headers;
    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else{
        const token = authorization.split(' ')[1];
        var {_id} =JSON.parse( Buffer.from(token.split('.')[1] , 'base64') );

        jwt.verify(token, process.env.monstera_USER_SECRET, async (err, decoded) =>{
            if( err ){
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();
                const {userSearchTxt}= req.body;
                let o_id = new ObjectId(_id);
                let query = {$and:[{'info.name': new RegExp(userSearchTxt) }, { '_id': {$ne: o_id}}]  };

                let projectq = {email:1,info:1};
                const result = await db.collection('users').find(query ).project(projectq).toArray();

                return  res.status(200).json(result);

            }
        })
    }
});


app.post('/monstera/api/discardnoti', async(req, res)=>{
    const {authorization } = req.headers;
    const { _id:notiid } = req.body;

    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else {
        const token = authorization.split(' ')[1];
        jwt.verify(token, process.env.monstera_USER_SECRET, async (err,decoded) => {
            if(err)
            {
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();
                query = {_id:new ObjectId(notiid)};
                const delresult = await db.collection('notif').deleteOne(query);
                return  res.status(200).json(delresult);

            }
        })
    }

});


app.post('/monstera/api/accepctjoininvite', async(req, res)=>{
    const {authorization } = req.headers;
    const { _id:notiid, notiTo: userId, channelId } = req.body;

    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else {
        const token = authorization.split(' ')[1];
        jwt.verify(token, process.env.monstera_USER_SECRET, async (err,decoded) => {
            if(err)
            {
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();

                let query = {userId: new ObjectId(userId), channelId:new  ObjectId( channelId )} ;
                const result = await db.collection('user_channel_map').insertOne(query);

                if(result.acknowledged) {
                    query = {_id:new ObjectId(notiid)};
                    const delresult = await db.collection('notif').deleteOne(query);
                }
                return  res.status(200).json(result);

            }
        })
    }

});


app.post('/monstera/api/sendChannelJoinInvite',async(req,res) => {

    const {authorization } = req.headers;
    const { userId: inviteTo , channelId} = req.body;

    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else{
        const token = authorization.split(' ')[1];
        var {_id} =JSON.parse( Buffer.from(token.split('.')[1] , 'base64') );

        jwt.verify(token, process.env.monstera_USER_SECRET, async (err,decoded) => {
            if(err)
            {
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();

                if (channelId != null) {

                    let o_id_invite_by = new ObjectId(_id);
                    let query = {_id:o_id_invite_by};
                    const user = await db.collection('users').findOne(query);

                    query = {_id :  new ObjectId(channelId)};
                    const channel = await db.collection('channels').findOne(query);


                    // if same notif is alredy sent to the same user then do not add in notif colection
                    query = { userId: new ObjectId(inviteTo), channelId: new ObjectId(channelId)};
                    const userchannel_count = await db.collection('user_channel_map').countDocuments(query);

                    query = {type:'channel_join_invite',   notiBy:o_id_invite_by,
                                notiTo : new ObjectId(inviteTo),
                                channelId: channelId};
                    const same_notif_count = await db.collection('notif').countDocuments(query);

                    if ( userchannel_count > 0 || same_notif_count > 0 ) {
                        return  res.status(500).json({ message : 'user is already there in this channel' });
                    }
                    //
                    query = {
                        type:'channel_join_invite',
                        notiBy:o_id_invite_by,
                        notiTo : new ObjectId(inviteTo),
                        channelId: channelId,
                        message: `${user.info.name} has invited you to join the channel ${channel.channelName}`
                    };
                    const result = await db.collection('notif').insertOne(query);

                    return  res.status(200).json(result);
                }
            }
        })
    }
});

app.post('/monstera/api/getnoti', async(req, res)=>{
    const {authorization } = req.headers;
    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else{
        const token = authorization.split(' ')[1];
        var {_id} =JSON.parse( Buffer.from(token.split('.')[1] , 'base64') );
        jwt.verify(token, process.env.monstera_USER_SECRET, async(err,decoded) => {
            if(err)
            {
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();
                let o_id = new ObjectId(_id);
                let query = {notiTo:o_id};

                const result =  await db.collection('notif').find(query).toArray();
                return  res.status(200).json(result);
            }
        })
    }
});


app.post('/monstera/api/sendmessage', async(req, res)=>{
    const {authorization } = req.headers;
    const {messagetxt,  channelId } = req.body;

    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else{
        const token = authorization.split(' ')[1];
        var {_id} =JSON.parse( Buffer.from(token.split('.')[1] , 'base64') );
        jwt.verify(token, process.env.monstera_USER_SECRET, async(err,decoded) => {
            if(err)
            {
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();
                let query = {messagesentby : new ObjectId(_id),  messagetxt: messagetxt,  channelId: new ObjectId(channelId) , datesent: new Date() };
                const result =  await db.collection('messages').insertOne(query);
                return  res.status(200).json(result);
            }
        })
    }
});




app.post('/monstera/api/getmessages', async(req, res)=>{
    const {authorization } = req.headers;
    const {  channelId } = req.body;

    if(!authorization) {
        res.statusMessage = 'no auth header in request';
        return res.status(401).json();
    }
    else{
        const token = authorization.split(' ')[1];
     
        jwt.verify(token, process.env.monstera_USER_SECRET, async(err,decoded) => {
            if(err)
            {
                res.statusMessage = 'not able to authenticate. (token could not be verified)';
                return res.status(401).json();
            }
            else {
                const db=getDb();
             
                    const result = await db.collection('messages').aggregate([
                        {$match : { channelId: new ObjectId(channelId)  }},
                        {
                            $lookup:{
                                from: 'users',
                                localField: 'messagesentby',
                                foreignField: '_id',
                                as: "usdata"
                            }
                        }
                    ]).toArray();
                return  res.status(200).json(result);
            }
        })
    }
});
