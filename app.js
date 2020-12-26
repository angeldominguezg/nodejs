const path = require('path');
const http = require('http');
const express = require('express');
const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error')

const sequelize = require('./util/database');

const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

sequelize.sync()
    .then( result  => {
        // console.log('[sequelize]', result)
        app.listen(3000);
    })
    .catch( err => {
        console.log('[sequelize].error', err);
    });