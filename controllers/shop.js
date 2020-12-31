const Product = require('../models/product');
const Cart = require('../models/cart');

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    Product.findAll()
    .then(products => {
        res.render('shop/product-list', { 
            prods: products, 
            pageTitle: 'All Products', 
            path: '/products', 
        });
    })
    .catch( err => {
        console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findByPk(productId)
    .then(product => {
        res.render('shop/product-detail', { 
            product: product, 
            pageTitle: 'Product Details', 
            path: '/products'
        });
    })
    .catch((err) => {
        console.log(err)
    });
};

exports.getIndex = (req, res, next) => {
    Product.findAll().then(
        (products) => {
            console.log(res);
            res.render('shop/index', { 
                prods: products, 
                pageTitle: 'Shop', 
                path: '/'
            });
        }
    ).catch( err => {
        console.log(err);
    });
};

exports.getCart = (req, res, next) => {
    // console.log('req.user.cart', req.user.cart);
    req.user.getCart()
        .then(cart => {
            console.log('cart', cart);
            return cart.getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products: products
                    });
                })
                .catch( err => console.log(err));
        })
        .catch( err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then( cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: {id: productId} });
        })
        .then( products => {
            let product;
            if(products.length > 0){
                product = products[0];
            }
            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1
                return product;
            }
            return Product.findByPk(productId);
        })
        .then( product => {
            return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch( err => console.log(err) );
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