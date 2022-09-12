require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser =  require('body-parser');
const encrypt = require('mongoose-encryption');
const ejs = require('ejs');

const app = express();

let port = process.env.port;
if (port == null || port =="") {
    port = 3000;
}
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.SECRET_STRING;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.post("/register", (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    const user = new User({
        email: email,
        password: password
    });
    user.save((err) => {
        if (err) {
            console.log(err);
        } else {
            res.render('secrets');
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    User.findOne({email: username}, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            if (response.password === password) {
                res.render('secrets');
            } else {
                res.send("<h1>Incorrect Credentials!!!</h1>");
            }
        }
    });
});

app.listen(port, ()=> {
    console.log("Server started on port " + port);
});