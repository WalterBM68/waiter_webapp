const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const pgPromise = require('pg-promise');
const pgp = pgPromise();
const WaitersAppDB = require('./database');
const WaiterRoutes = require('./routes');
const routes = require('./routes');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:pg123@localhost:5432/waiters_app';
const config = {
  connectionString: DATABASE_URL
}
if (process.env.NODE_ENV == 'production') {
	config.ssl = {
		rejectUnauthorized : false
	}
}
const db = pgp(config);

app.engine("handlebars", hbs.engine({ extname: "handlebars", layoutsDir: __dirname + '/views/layouts' }));
app.set('view engine', 'handlebars');
app.use(express.static("public"));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const waitersAppDB = WaitersAppDB(db);
const waiterRoutes = WaiterRoutes(waitersAppDB);

//Register new waiters
app.get('/', waiterRoutes.showRegistrationScreen);
app.post('/register', waiterRoutes.registerTheUser);
//login the waiter
app.get('/login', waiterRoutes.getLogingScreen);
app.post('/login', waiterRoutes.logingTheUser);
//waiters
app.get('/waiters', waiterRoutes.getWaitersPage);
app.post('/waiters', waiterRoutes.waitersToChooseWorkingDays);
//days 
app.get('/days', waiterRoutes.showSelecetedDays);
app.post('/days', waiterRoutes.adminToAddWaitersDays);
//delete
app.post('/delete', waiterRoutes.deleteScheduledWaiters);

const PORT = process.env.PORT || 9000;
app.listen(PORT, function(){
  console.log('The waiters app started at port number:', PORT);
});
