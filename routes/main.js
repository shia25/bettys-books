// Create a new router
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

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
})

router.get('/about',function(req, res, next){
    res.render('about.ejs')
})

//logout
router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
     return res.redirect('/')
    }
    res.send('you are now logged out. <a href='/'>Home</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router