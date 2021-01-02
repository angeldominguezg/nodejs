const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;


const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://adominguez:4MJeRR7pxoN10hnT@cluster0.xeicl.mongodb.net/<dbname>?retryWrites=true&w=majority')
        .then(client => {
            console.log('connected!');
            callback(client);
        })
        .catch( err => console.log(err));
}

module.exports = mongoConnect;