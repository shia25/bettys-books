// Create a new router
const express = require("express")
const router = express.Router()

//bcrypt securty setting
const bcrypt = require('bcrypt');
const saltRounds = 10;

const { redirectLogin } = require('../index'); // Import redirectLogin



console.log('redirectLogin middleware is defined and ready for use.');


// GET route to show the registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs')                                                               
})    

// POST route to handle the registration form submission
router.post('/registered', function (req, res, next) {

    // Extracting user details from register form submission
    const plainPassword = req.body.password; 
    const username = req.body.username;
    const first = req.body.first; 
    const last = req.body.last; 
    const email = req.body.email; 

   // Hash the password before storing it
   bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
    if (err) {
        res.status(500).send("Error hashing the password");
    }

        // Database logic to store user details
        const sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)`;
        const values = [username, first, last, email, hashedPassword];

        db.query(sqlquery, values, (error, results) => {
                if (error) {
                    console.error("Database error:", error); // Log the actual error
                    res.status(500).send("Error saving user to the database");
                }
                res.send(`Hello ${first} ${last}, you are now registered! We will send an email to you at ${email}. Your hashed password is: ${hashedPassword}`);
        });
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
            res.status(500).send("Error fetching users from the database");
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
router.post('/loggedin', function (req, res, next) {
    const username = req.body.username;
    const plainPassword = req.body.password;
    req.session.userId = req.body.username;

    // Query to fetch the user based on the username
    const sqlquery = 'SELECT * FROM users WHERE username = ?';
    db.query(sqlquery, [username], (err, result) => {
        if (err || result.length === 0) {
            // If there is an error or no user found, handle it
            res.status(400).send("Invalid username or password");
        }

        const user = result[0];  // Fetch the user object from the query result

        // Now compare the plain password with the stored hashed password
        bcrypt.compare(plainPassword, user.hashedPassword, (err, match) => {
            if (err) {
                // Handle bcrypt error
                res.status(500).send("Error comparing passwords");
            }
            if (match) {
                // Passwords match, login successful
                res.send(`Welcome, ${user.first_name}!`);
            } else {
                // Passwords don't match, login failed
                res.status(400).send("Invalid username or password");
            }
        });
    });
});

// Export the router object so index.js can access it
module.exports = router;
