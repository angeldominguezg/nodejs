const path = require('path');
const express = require('express');
const shopController = require('../controllers/shop')

const router = express.Router();


router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/chekout', shopController.getCheckout);

router.get('/', shopController.getIndex);

module.exports = router;