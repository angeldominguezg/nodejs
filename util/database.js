const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

require('dotenv').config();

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.xeicl.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('connected!');
            _db = client.db();
            callback(client);
        })
        .catch( err => {
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;