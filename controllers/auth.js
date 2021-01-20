const { get } = require("mongoose");

exports.getLogin = (req, res, next) => {

  const isLoggedIn = req.session.isLoggedIn;
  console.log('isLoggedIn', req.session.isLoggedIn);

  res.render('auth/login', {  
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn= true;
  res.redirect('/');
};