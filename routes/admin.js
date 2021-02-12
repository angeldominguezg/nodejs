const path = require('path');
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth.js');

const { body } = require('express-validator/check');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', [
  body('title').isString().isLength({min: 3}).trim(),
  body('imageUrl').isURL(),
  body('price').isFloat(),
  body('description').isLength({min: 5}).trim()
], isAuth, adminController.postAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
  body('title').isString().isLength({min: 3}).trim(),
  body('imageUrl').isURL(),
  body('price').isFloat(),
  body('description').isLength({min: 5}).trim()
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;

