
const express = require('express');
const app = express();
const flash = require('express-flash');
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

module.exports = waiterRoutes = (waitersAppDB) =>{

    const getLogingScreen = async (req, res) => {
        res.render('/');
    }
    const logingTheUser = async (req, res) => {
        res.redirect('');
    }

    return{
        getLogingScreen,
        logingTheUser,
    }
}