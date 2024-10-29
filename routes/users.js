//
const { check, validationResult } = require('express-validator');

// Create a new router
const express = require("express")
const router = express.Router()

//bcrypt securty setting
const bcrypt = require('bcrypt');
const saltRounds = 10;


// redirect login if user is not in session
const redirectLogin = (req, res, next) => {
    console.log('RedirectLogin middleware is executed'); // Check if middleware is being executed
    if (!req.session.userId ) {
      res.redirect('/users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

console.log('redirectLogin middleware is defined and ready for use.');


// GET route to show the registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs')                                                               
})    

// POST route to handle the registration form submission
router.post('/registered',
     [check('email').isEmail().withMessage('Invalid email format')
        //helps normalize emails  (User@Example.com  --> user@example.com)
        .normalizeEmail(),
    //password must 8 character long
     check('password').isLength({ min: 8 }),
     check('username')
        .trim()         // Trim whitespace
        .escape()       // Escape special characters to prevent XSS
        .isAlphanumeric().withMessage('Username must be alphanumeric')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')],
     check('first').trim().escape(), // Sanitize first name
     check('last').trim().escape(),   // Sanitize last name

     async (req, res)=> {
    //validation checking is user input is empty
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //res.redirect('./register');
            //to better handle returning validation errors
            res.status(400).json({ errors: errors.array() });

         }

    // Extracting user details from register form submission
    // making extracting user details for concise

    const {password, username, first, last, email} = req.body;
    //hashed password now will be used only called upon
    const hashedPassword = await bcrypt.hash(password, saltRounds);


        // Database logic to store user details
        const sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)`;
        const values = [username, first, last, email, hashedPassword];

        db.query(sqlquery, values, (error, results) => {
                if (error) {
                    console.error("Database error:", error); // Log the actual error
                    return res.status(500).send("Error saving user to the database");
                }
                res.send(`Hello ${first} ${last}, you are now registered! We will send an email to you at ${email}. Your hashed password is: ${hashedPassword}`);
        });
});



// Route to get a list of all users (excluding the password)
router.get('/users_list', redirectLogin,function (req, res, next) {

    // SQL query to select all users details except the hashedPassword 
    let sqlquery = "SELECT username, first_name, last_name, email FROM users";
    
    // Execute the query
    db.query(sqlquery, (err, result) => {
        if (err) {
            // Handle the error if query fails
            console.error("Database error:", err);
            return res.status(500).send("Error fetching users from the database");
        }

        // Render the result in the 'users_list.ejs' view file
        res.render("users_list.ejs", { userList: result });
    });
});

// GET route to show the login form
router.get('/login', function (req, res, next) {
    res.render('login.ejs')                                                               
})    

// POST route for handling login
router.post('/loggedin', async (req, res) =>{
    const {username, password} = req.body;

    req.session.userId = req.body.username;

    // Query to fetch the user based on the username
    const sqlquery = 'SELECT * FROM users WHERE username = ?';
    db.query(sqlquery, [username], async (err, result) => {
        if (err || result.length === 0) {
            // If there is an error or no user found, handle it
            res.status(400).send("Invalid username or password");
        }

        const user = result[0];  // store the user object from the query result

        // Now compare the plain password with the stored hashed password
       const match = await bcrypt.compare(password, user.hashedPassword);
          
            if (match) {
                // Passwords match, login successful
                res.send(`Welcome, ${user.first_name}!`);
                //after login it redirects to the hompage
               // res.redirect('/')
            } else {
                // Passwords don't match, login failed
                res.status(400).send("Invalid username or password");
            }
    });
});

// Export the router object so index.js can access it
module.exports = router;
