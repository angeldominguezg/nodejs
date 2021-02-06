const express = require('express');
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const { validate } = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', 
  check('email')
    .isEmail()
    .withMessage('Please enter a valid Email')
    .custom((value, {req}) => {
      if(value === 'test@test.com'){
        throw new Error('This email address is forbidden');
      } else {
        return true;
      }
    }),
  body('password', 'Please enter a password with only numbers, text and at least 5 characters.')
    .isLength({min: 5})
    .isAlphanumeric(),
  authController.postSignup);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;