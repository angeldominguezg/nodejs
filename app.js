const path = require('path');
// const http = require('http');
require('dotenv').config();
const express = require('express');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.xeicl.mongodb.net/shop';

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.use(session({ 
    secret: 'my_secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    User.findById('5ffd6f5174215211ef56d625')
        .then( user => {
            req.user = user;
            next();
        })
        .catch( err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    User.findOne().then(user => {
      if(!user) {
        const user = new User({
          name: 'Angel',
          email: 'adominguez@mail.com',
          cart: {
            items :[]
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => console.log('Mongoose connerc err:', err));