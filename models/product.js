const mongoDb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, imageUrl, price, description, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = new mongoDb.ObjectId(id);
    }

    save() {
        const db = getDb();
        let dbOp;
        if(this._id){
          // Updated the product
          dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this});
        } else {
          dbOp = db.collection('products').insertOne(this);
        }
        return dbOp
          .then((result) => {
            console.log(result);
          })
          .catch((err) => {
            console.log(err);
          });
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
            .then(products => {
                console.log(products)
                return products
            })
            .catch(err => console.log(err));
    }

    static findById(productId) {
        const db = getDb();
        return db.collection('products').find({_id: new mongoDb.ObjectId(productId)})
            .next()
            .then(product => {
                console.log('product', product);
                return product;
            })
            .catch(err => console.log(err));
    }
}

module.exports = Product;