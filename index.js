// Import express and ejs
var express = require ('express')
var ejs = require('ejs')

//Import mysql module
var mysql = require('mysql2')


// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Set up public folder (for css and statis js)
app.use(express.static(__dirname + '/public'))

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'bettys_books_app',
    password: 'qwertyuiop',
    database: 'bettys_books'
})
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
global.db = db

// Define our application-specific data
app.locals.shopData = {shopName: "Bettys Books"}

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`))

/*
//form submission for adding a new book
app.post('/books/add', (req, res) => {
    //res parameters
    const { name, price } = req.body;

    if (name && price) {
        // const prevents reassignment. If the value is primitive (like a string, number, boolean),
        // the actual value can't be changed or replaced once declared.

        const query = 'INSERT INTO books (name, price) VALUES (?, ?)';//query itself
        db.query(query, [name, price], (err, result) => {//query pluggled into js
            if (err) {
                res.send('Error saving book to the database');
                console.log(err);
            } else {
                res.redirect('/books');  // Redirects to book list after adding a book
            }
        });
    } else {
        res.send('Book name or price is missing!');
    }
});


// Display the list of all books
app.get('/books', (req, res) => {
    const query = 'SELECT * FROM books';
    db.query(query, (err, results) => {
        if (err) {
            //error handler 
            res.send('Error retrieving books from the database');
            console.log(err);
        } else {
            res.render('booksList', { books: results });  // Renders 'booksList.ejs' with books data
        }
    });
});*/
