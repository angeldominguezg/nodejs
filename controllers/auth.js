const { get } = require("mongoose");
const User = require('../models/user');
const bcryptjs = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {  
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
  .then( user => {
        if (!user) {
          return res.redirect('/login')
        }
        // Validate the password
        bcryptjs
        .compare(password, user.password)
        .then(doMatchPass => {
          if (doMatchPass) {
            req.session.isLoggedIn= true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            })
          }
          res.redirect('/login');
        })
        .catch( err => {
          console.log(err)
        });
      })
      .catch( err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.consfirmPassword;

  User.findOne({email: email})
    .then(userDoc => {
      if (userDoc){
        return res.redirect('/signup');
      } else {
        return bcryptjs
          .hash(password, 12)
          .then(hashedPassword => {
            const user = new User({
              name: name,
              email: email,
              password: hashedPassword,
              cart: { items: [] }
            });
            return user.save();
          })
          .then( result => {
            res.redirect('/login');
          });
      }
    })
    .catch( err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};