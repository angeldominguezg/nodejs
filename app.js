const path = require('path');

require('dotenv').config();
const express = require('express');

// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const MONGODB_URI = 'mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.xeicl.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { error } = require('console');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
    secret: 'my_secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());


// User session middleware
app.use((req, res, next)=>{
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then( user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err);
    })
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
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