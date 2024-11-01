// Import express-validator checks
const {check, validationResult} = require('express-validator')
const express = require("express")
const router = express.Router()

// redirect login if user is not in session
const redirectLogin = (req, res, next) => {
    console.log('RedirectLogin middleware is executed'); // Check if middleware is being executed
    if (!req.session.userId ) {
      res.redirect('/users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/search',function(req, res, next){
    res.render("search.ejs")
})


router.get('/search_result',  [
    //sanitization on search
    check('search_text').trim().escape()],
    function (req, res, next) {

    // Validation error handling ?
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Search the database ?
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    db.query(sqlquery, [`%${req.query.search_text}%`], (err, result) => {
        if (err) return next(err);
        res.render("list.ejs", { availableBooks: result });
    });
})


router.get('/list', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT * FROM books" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
     })
})

router.get('/addbook', redirectLogin, function (req, res, next) {
    res.render('addbook.ejs')
})

router.post('/bookadded', [
    check('name').trim().escape().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    check('price').isNumeric().withMessage('Price must be a number')],
    function (req, res, next) {

    // Validation error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // execute sql query
    db.query(sqlquery, [req.body.name, req.body.price], (err, result) => {
        if (err) return next(err);
        // backtick string for reading string intrapolation
        res.send(`This book is added to database, name: ${req.body.name}, price: £ ${req.body.price}`);
    });
}) 

router.get('/bargainbooks', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("bargains.ejs", {availableBooks:result})
    })
}) 


// Export the router object so index.js can access it
module.exports = router