const express = require('express');
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const { validate } = require('../models/user');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', 
  check('email')
    .isEmail()
    .withMessage('Please enter a valid Email')
    .custom((value, {req}) => {
      return User.findOne({email: value})
        .then(userDoc => {
          if (userDoc){
            return Promise.reject('E-mail exists already, please pick a different one.');
          }
      });
    }),
  body(
      'password', 
      'Please enter a password with only numbers, text and at least 5 characters.')
    .isLength({min: 5})
    .isAlphanumeric(),
  body('confirmPassword')
    .custom( (value, { req }) => {
      if(value !== req.body.password) {
        throw new Error('Password have to match');
      } else {
        return true;
      }
    }),
  authController.postSignup);

router.post('/login', 
  check('email')
    .isEmail()
    .withMessage('Please enter a valid Email'),
  body(
    'password', 
    'Please enter a password at least 5 characters.')
    .isLength({min: 5})
  ,authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;