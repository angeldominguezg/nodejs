require('dotenv').config();
const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

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
      errorMessage: message,
      oldInput: { email: '', password: '' },
      validationErrors: []
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
    errorMessage: message,
    oldInput: { name: '', email: '', password: '' },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email })
  .then( user => {
        if (!user) {
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: false,
            errorMessage: 'Invalid email or password.',
            oldInput: { email: email, password: password },
            validationErrors: [{param: 'email', param: 'password'}]
          });
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: false,
            errorMessage: 'Invalid email or password.',
            oldInput: { email: email, password: password },
            validationErrors: [{param: 'email', param: 'password'}]
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
      })
      .catch( err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.consfirmPassword;

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log( errors.array() );
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { name: name, email: email, password: password },
      validationErrors:  errors.array()
    });
  }
  bcryptjs
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if( message.length > 0 ){
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: false,
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log('err', err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then( user => {
        if(!user) {
          req.flash('error', 'No acconut with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then( result => {
        console.log('TOKEN', `href="http://localhost:3000/reset/${token}`);
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'node-shop@mail.test',
          subject: 'Password Reset',
          text: 'Password Reset',
          html: `
            <p>You request a password reset</p>
            <p>Click this link to <a href="http://localhost:3000/reset/${token}">set new password</a></p>
            `
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: {$gt: Date.now() }})
    .then( user => {
      let message = req.flash('error');
      if( message.length > 0 ){
        message = message[0]
      } else {
        message = null
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then( user => {
      resetUser = user;
      return bcryptjs.hash(newPassword, 12);
    })
    .then( hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}