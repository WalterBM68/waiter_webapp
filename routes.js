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
    const showRegistrationScreen = async (req, res) => {
        await waitersAppDB.getWaitersDatails();
        res.render('index');
    }
    const registerTheUser = async (req, res) => {
        let {firstname, surname} = req.body;
        if(firstname && surname){
            firstname = firstname.toLowerCase();
            surname = surname.toLowerCase();
            let code = uid();
            uniqueCode = code;
            const theWaiter = await waitersAppDB.checkWaitersName(firstname);
            if(Number(theWaiter.count) !== 0){
                req.flash('error', `${firstname} already exists`);
            }else{
                await waitersAppDB.storeWaitersDetails(firstname, surname, code);
                req.flash('success', 'You have registered!!! use this code to login: ' + uniqueCode)
            }
        }else{
            req.flash('error', 'Please register with your details below');
        }
        res.redirect('/');
    }
    const getLogingScreen = async (req, res) => {
        res.render('login');
    }
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
    const waitersToChooseWorkingDays = async (req, res) => {
        const waiterId = req.session.loginUniqueCode.id;
        const days = req.body.days;
        if(days){
            await waitersAppDB.choosingOfDaysByTheWaiters(waiterId, days);
            req.flash('success', "Thank you for selecting your working days");
        }else{
            req.flash('error', 'Please select your working days');
        }
        res.redirect('/waiters'); 
    }
    const showSelecetedDays = async (req, res) => {
        const theWeekDays = await waitersAppDB.getWeekDays();
        res.render('days',{
            theWeekDays
        });
    }
    const adminToAddWaitersDays = async (req, res) => {
        res.redirect('/days');
    }
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