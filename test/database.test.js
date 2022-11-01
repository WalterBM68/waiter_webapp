const assert = require('assert');
const pgPromise = require('pg-promise');
const pgp = pgPromise();
const WaitersAppDB = require('./database');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:pg123@localhost:5432/'; //To add database for test
const config = {
  connectionString: DATABASE_URL
}
if (process.env.NODE_ENV == 'production') {
	config.ssl = {
		rejectUnauthorized : false
	}
}
const db = pgp(config);

describe('Testing Reg numbers database', function(){
    it('It should store the waiters name & surname to the database', async function(){
        try {
           let waitersAppDB = WaitersAppDB(db);
        } catch (error) {
           console.log(error); 
        }
    });
});