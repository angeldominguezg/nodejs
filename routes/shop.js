const path = require('path');
const express = require('express');
const shopController = require('../controllers/shop')

const router = express.Router();

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.post('/cart', shopController.postCart);

router.get('/cart', shopController.getCart);

router.get('/chekout', shopController.getCheckout);

router.get('/orders', shopController.getOrders);

router.get('/', shopController.getIndex);

module.exports = router;