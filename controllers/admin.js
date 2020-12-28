const { request } = require('express');
const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',{ 
        pageTitle: "Add Product", 
        path: '/admin/add-product', 
        activeAddProduct: true,
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    Product.create({
        title: title,
        description: description,
        price: price,
        imageUrl: imageUrl,
    }).then( result => {
        console.log(result);
        res.redirect('/');
    }).catch( err => {
        console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
    Product.findAll()
    .then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        })
    })
    .catch(err => {
        console.log(err);
    })
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    console.log('editMode', editMode);
    if(!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findByPk(productId)
        .then(product => {
            if(!product){
                console.log('[getEditProduct] Error not find product to edit');
                return redirect('/');
            }
            res.render('admin/edit-product',{ 
                pageTitle: "Edit Product", 
                path: '/admin/edit-product', 
                editing: editMode,
                product: product
            });
        })
        .catch( err => {
            console.log(err);
        })
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;

    Product.findByPk(productId)
    .then(product => {
        product.title = updatedTitle;
        product.imageUrl = updatedImageUrl;
        product.price = updatedPrice;
        product.description = updatedDesc;
        return product.save();
    })
    .then(result => {
        console.log('Updated Product!');
        res.redirect('/admin/products')
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByPk(productId)
        .then(product => {
            return product.destroy();
        })
        .then( result => {
            console.log('Product deleted!');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};