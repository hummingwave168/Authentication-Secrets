require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser =  require('body-parser');
const ejs = require('ejs');

// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

let port = process.env.port;
if (port == null || port == "") {
    port = 3000;
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// const secret = process.env.SECRET_STRING;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
// const saltRounds = 10;
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

// Simplified Passport-Local Configuration
passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username });
    });
});
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) { 
            console.log(err); 
        }
        res.redirect("/");
    });
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.post("/register", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    User.register({username: email}, password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req, res) => {
    const user = new User({
        email: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, ()=> {
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(port, () => {
    console.log("Server started on port " + port);
}); 