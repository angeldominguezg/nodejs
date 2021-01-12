const Product = require('../models/product');

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getIndex = (req, res, next) => {
    Product.find()
      .then(
        (products) => {
            // addToCart.log(res);
            res.render('shop/index', { 
                prods: products, 
                pageTitle: 'Shop', 
                path: '/'
            });
        }
      )
      .catch( err => {
        console.log(err);
      });
};

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        // console.log('getProducts: ', products);
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
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then( user => {
      console.log('user.cart.items', user.cart.items);
      const products = user.cart.items;
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
  req.user.removeFromCart(productId)
    .then(updatedCart => {
      res.redirect('/cart');
    })
    .catch( err => console.log(err));
};