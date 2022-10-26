const express = require('express');
const app = express();
const flash = require('express-flash');
const session = require('express-session');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 6 });

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
/*
app.use(function(req, res, next){
	if(req.path === '/login' || req.path === '/waiters'){
		next();
	}else{
		if(!req.session.loginUniqueCode){
            res.redirect('/login');
            return;
        }
		next();
	}
});
*/
module.exports = waiterRoutes = (waitersAppDB) =>{
    let uniqueCode = '';
    //Home route(The GET route)
    const showRegistrationScreen = async (req, res) => {
        await waitersAppDB.getWaitersDatails();
        res.render('index');
    }
    //Home route(The POST route)
    const registerTheUser = async (req, res) => {
        let {firstname, surname} = req.body;
        if(firstname && surname){
            firstname = firstname.toLowerCase();
            let waiter = firstname.charAt(0).toUpperCase() + firstname.slice(1);
            let code = uid();
            uniqueCode = code;
            const theWaiter = await waitersAppDB.checkWaitersName(waiter);
            if(Number(theWaiter.count) !== 0){
                req.flash('error', `${waiter} already exists`);
            }else{
                await waitersAppDB.storeWaitersDetails(waiter, surname, code);
                req.flash('success', 'You have registered!!! use this code to login: ' + uniqueCode)
            }
        }else{
            req.flash('error', 'Please enter your Name & Surname to register');
        }
        res.redirect('/');
    }
    //Login route(The GET route)
    const getLogingScreen = async (req, res) => {
        res.render('login');
    }
    //Login route(The POST route)
    const logingTheUser = async (req, res) => {
        const {code} = req.body;
        if(code){
           const loginUniqueCode = await waitersAppDB.getTheUniqueCode(code);
           if(loginUniqueCode){
                req.session.loginUniqueCode = loginUniqueCode;
                res.redirect('/waiters');
                return;
            }
        }else{
            req.flash('error', 'This code is invalid');
            res.render('login');
        }
    }
    //Waiters route(GET route)
    const getWaitersPage = async (req, res) => {
        if(!req.session.loginUniqueCode){
            res.redirect('/login');
            return;
        }
        const theWeekDays = await waitersAppDB.getWeekDays();
        res.render('waiters',{
            loginUniqueCode: req.session.loginUniqueCode,
            theWeekDays
        });
    }
    //Waiters route(POST route)
    const waitersToChooseWorkingDays = async (req, res) => {
        const waiterId = req.session.loginUniqueCode.id;
        const days = req.body.days;
        let name = req.session.loginUniqueCode.firstname;
        let waiter = name.charAt(0).toUpperCase() + name.slice(1);
        if(days){
            await waitersAppDB.choosingOfDaysByTheWaiters(waiterId, days);
            await waitersAppDB.filterDays(waiterId, days);
            req.flash('success', `Thank you for updating your working days ${waiter}`);
        }else{
            req.flash('error', 'Please select your working days');
        }
        res.redirect('/waiters'); 
    }
    //Admin route(GET route)
    const showSelecetedDays = async (req, res) => {
        if(!req.session.loginUniqueCode){
            res.redirect('/login');
            return;
        }
        let waiterName = req.session.loginUniqueCode.id;
        const showSelectedDays = await waitersAppDB.showDays(waiterName);
        const theWeekDays = await waitersAppDB.getWeekDays();
        res.render('days',{
            showSelectedDays,
            theWeekDays
        });
    }
    //Admin route(POST route)
    const adminToAddWaitersDays = async (req, res) => {
        res.redirect('/days');
    }
    //Delete route
    const deleteScheduledWaiters = async (req, res) => {
        await waitersAppDB.deleteWaiters();
        req.flash('error', 'Waiters schedule days have been deleted');
        res.redirect('/');
    }
    return{
        showRegistrationScreen,
        registerTheUser,
        getLogingScreen,
        logingTheUser,
        getWaitersPage,
        waitersToChooseWorkingDays,
        showSelecetedDays,
        adminToAddWaitersDays,
        deleteScheduledWaiters
    }
}