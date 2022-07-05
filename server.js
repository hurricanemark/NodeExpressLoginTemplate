if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const SES_SECRET = process.env.SES_SECRET || '1432a49ecfcd0a17e8cce22554fc0b22cfaf790af8a9bc7873c7bbf235d498ccb4c87ce42530da7f76ff22a3d96e098b766980615687d9fbfb8e2b6ee2ae96a7';
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');

initializePassport(
    passport, 
    email => users.find(user => user.email === email), // get user by email
    id =>  users.find(user => user.id === id) // get user by id
    );

const users = [] // create an empty array to store the users (only retain during session).  DO NOT KEEP THIS IN PRODUCTION!!!  MUST BE IN SERVER DATABASE.

app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(express.urlencoded({ extended: false })); // use express to parse the body of the request
app.use(flash()); // use express-flash to flash messages to the user

app.use(session({
    secret: SES_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method')); // use method-override to allow the use of the _method parameter in index.ejs 's form

// Routes.  From here, there'll be dragons.
// --------------------------------------------------------------------------------------------------------------------

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name});
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

// POST a register request involed encryption and saving the user to the database.
// bcrypt is used to hash the password into a hashed object.
// users array is in runtime memory, and will be wiped out when the server is restarted.
// In production, users object should be stored in a database.
app.post('/register', checkNotAuthenticated, async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        users.push({
            id: Date.now().toString(), 
            name: name, 
            email: email, 
            password: hashedPassword
        });
        res.redirect('/login'); // redirect to the login page for the user to login
    } catch (err) {
        console.log(err);
        res.redirect('/register');
    }
    console.log("Registering for ", users);  
});

// logging out requires method-override to be enabled.
app.delete('/logout', (req, res) => {
    req.logOut(function(err) {
        if (err) { return next(err); 
        } else {
            res.redirect('/login');
        }
    })
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.listen(PORT, () => { console.log('Server is running on port ' + PORT) });