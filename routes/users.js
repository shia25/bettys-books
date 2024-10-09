// Create a new router
const express = require("express")
const router = express.Router()

//bcrypt securty setting
const bcrypt = require('bcrypt');
const saltRounds = 10;

// GET route to show the registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs')                                                               
})    

// POST route to handle the registration form submission
router.post('/registered', function (req, res, next) {

    // Extracting user details from register form submission
    const plainPassword = req.body.password; 
    const first = req.body.first; 
    const last = req.body.last; 
    const email = req.body.email; 

    // Hash the password before storing it
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err) {
            return res.status(500).send("Error hashing the password");
        }
        // Send response (or store in the database)
        // using template literals for readability and maintainability
        res.send(`Hello ${first} ${last}, you are now registered! We will send an email to you at ${email}. Your hashed password is: ${hashedPassword}`);
    });
});


// Export the router object so index.js can access it
module.exports = router