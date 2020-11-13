const path = require('path');
const express = require('express');
const router = express.Router();
const productControllet = require('../controllers/product')


router.get('/', productControllet.getProducts);

module.exports = router;