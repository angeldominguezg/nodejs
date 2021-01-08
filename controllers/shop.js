const Product = require('../models/product');
// const Order = require('../models/order');

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then(
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

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
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
    Product.findById(productId)
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

exports.getCart = (req, res, next) => {
    // console.log('req.user.cart', req.user.cart);
    req.user.getCart()
        .then( products => {
          console.log('products', products);
          res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products
          })
        })
        .catch( err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
      .then(product => {
        return req.user.addToCart(product);
      })
      .then( result => {
        res.redirect('/cart');
      })
      .catch( err => console.log(err));
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user
      .addOrer()
      .then( result => {
          res.redirect('/orders');
      })
      .catch(err => {
          console.log(err);
      });
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then( orders => {
            console.log('orders', orders);
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user.deleteItemFromCart(productId)
    .then(updatedCart => {
      res.redirect('/cart');
    })
    .catch( err => console.log(err));
};