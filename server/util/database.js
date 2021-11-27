const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db; 

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb://localhost')
    .then((result) => {
        console.log('connected to mongodb');
        db = result.db('monstera');
        callback();
    })
    .catch((err) => {
        console.log(err);
    });
};

const getDb = () =>{
    if(db) { return db; }
    else { console.log('db not found'); }
}
exports.mongoConnect= mongoConnect;
exports.getDb=getDb;