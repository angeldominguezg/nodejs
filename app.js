const path = require('path');
const http = require('http');
const express = require('express');
const app = express();

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

app.engine('hbs', expressHbs({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout'}));
app.set('view engine', 'hbs');
// app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    res.status(404).render('404', { pageTitle: 'Page not found!' });
});


app.listen(3000);