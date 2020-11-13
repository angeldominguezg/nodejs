const path = require('path');
const express = require('express');
const router = express.Router();
const productControllet = require('../controllers/product')

router.get('/add-product', productControllet.getAddProduct);
router.post('/add-product', productControllet.postAddProduct);

module.exports = router;

