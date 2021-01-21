const Product = require('../models/product');
const Order = require('../models/order');
const product = require('../models/product');

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
                path: '/',
                isAuthenticated: req.session.isLoggedIn
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
            isAuthenticated: req.session.isLoggedIn 
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
            path: '/products',
            isAuthenticated: req.session.isLoggedIn
        });
    })
    .catch((err) => {
        console.log(err)
    });
};

exports.getCart = (req, res, next) => {
  req.session.user
    .populate('cart.items.productId')
    .execPopulate()
    .then( user => {
      console.log('user.cart.items', user.cart.items);
      const products = user.cart.items;
      res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          isAuthenticated: req.session.isLoggedIn
      })
    })
    .catch( err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then(product => {
      return req.session.user.addToCart(product);
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

  req.session.user
  .populate('cart.items.productId')
  .execPopulate()
  .then( user => {
    // console.log('user.cart.items', user.cart.items);
    const products = user.cart.items.map( i => { 
      return { quantity: i.quantity, product: { ... i.productId._doc }};
    });
    const order = new Order({
      user: {
        name: req.session.user.name,
        userId: req.session.user
      },
      products: products
    });
    return order.save();
  })
  .then( result => {
    return req.session.user.clearCart();
  })
  .then( result => {
    res.redirect('/orders');
  })
  .catch(err => {
      console.log(err);
  });
};

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.session.user._id})
    .then(orders => {
      console.log('orders', orders);
      res.render('shop/orders', {
          path: '/orders',
          pageTitle: 'Orders',
          orders: orders,
          isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.session.user.removeFromCart(productId)
    .then(updatedCart => {
      res.redirect('/cart');
    })
    .catch( err => console.log(err));
};