const { get } = require("mongoose");
require('dotenv').config();
const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_API
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if( message.length > 0 ){
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', { 
      path: '/login',
      pageTitle: 'Login',
      errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if( message.length > 0 ){
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log('csrf', req.body._csrf);

  User.findOne({ email: email })
  .then( user => {
        if (!user) {
          req.flash('error', 'Invalid email or password.');
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
          req.flash('error', 'Invalid email or password.');
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
        req.flash('error', 'E-mail exists already, please pick a different one.');
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
            return transporter.sendMail({
              to: email,
              from: 'node-shop@mail.test',
              subject: 'Signup Succeeded',
              text: 'Hello world',
              html: '<b>Hello world</b>'
            });
          })
          .catch( err => {
            console.log(err);
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