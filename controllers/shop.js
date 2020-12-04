const Product = require('../models/product');
const Cart = require('../models/cart');

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/product-list', { 
                prods: rows, 
                pageTitle: 'All Products', 
                path: '/products', 
            });
        })
        .catch( err => { console.log(err) });
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
    .then(([product]) => {
        res.render('shop/product-detail', { 
            product: product[0], 
            pageTitle: 'Product Details', 
            path: '/products'
        });
    })
    .catch((err) => {
        console.log(err)
    });
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/index', { 
                prods: rows, 
                pageTitle: 'Shop', 
                path: '/'
            });
        })
        .catch( err => { console.log(err) });
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id)
                if(cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty});
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts
            });
        });
    });
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    console.log('productId', productId);
    Product.findById(productId, product => {
        Cart.addProduct(productId, product.price);
    });
    res.redirect('/cart');
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Orders'
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
 const productId = req.body.productId;
 console.log('[postCartDeleteProduct] productId', productId);
 const product = Product.findById(productId, product => {
     Cart.deleteProduct(productId, product.price);
     res.redirect('/cart')
 });
};