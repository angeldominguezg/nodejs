const path = require('path');
const http = require('http');
const express = require('express');
const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error')

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then( user=> {
            req.user = user;
            next();
        })
        .catch( err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

sequelize.sync()
    .then( result  => {
        return User.findByPk(1);
        // console.log('[sequelize]', result)
    })
    .then(user => {
        if(!user) {
            return User.create({
                name: 'Angel',
                email: 'testing@mail.com'
            });
        }
        return user
    })
    .then( user => {
        console.log(user);
        app.listen(3000);
    })
    .catch( err => {
        console.log('[sequelize].error', err);
    });