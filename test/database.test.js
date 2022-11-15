
const assert = require('assert');
const pgPromise = require('pg-promise');
const pgp = pgPromise();
const WaitersAppDB = require('../database');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:pg123@localhost:5432/waiters_app_tests';
const config = {
  connectionString: DATABASE_URL
}
if (process.env.NODE_ENV == 'production') {
	config.ssl = {
		rejectUnauthorized : false
	}
}
const db = pgp(config);

describe('Testing Waiters database', function(){

   it('Firstly it should check if the name of a waiter is in the table before inserting the new one', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         let results = await waitersAppDB.checkWaitersName('Musa');
         assert.equal('0', results.count);
      } catch (error) {
         console.log(error); 
      }
   });

   it('It should store all waiters details into the waiters table', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         await waitersAppDB.storeWaitersDetails('Dean', 'Ndlovu', "hyufga", '0759871456');
         await waitersAppDB.storeWaitersDetails('Ndofaya', 'Ngcobo', 'gmuyi8', '0722541103');
         let results = await waitersAppDB.getWaitersDatails();
         assert.equal('Dean', results[0].firstname);
         assert.equal('Ndlovu', results[0].surname);
         assert.equal("hyufga", results[0].code);
         assert.equal('0759871456', results[0].cell_number);
         await db.none("delete from waiters;");
         //second waiter
         assert.equal('Ndofaya', results[1].firstname);
         assert.equal('Ngcobo', results[1].surname);
         assert.equal('gmuyi8', results[1].code);
         assert.equal('0722541103', results[1].cell_number);
         await db.none("delete from waiters;");
      } catch (error) {
         console.log(error); 
      }
   });

   it('It should detele waiters deteils from the waiters table', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         assert.equal(null, await waitersAppDB.clearWaitersDetails());
      } catch (error) {
         console.log(error); 
      }
   });

   it('Before we allow the waiter to choose his/her working days, we must check all the weekdays if they are there', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         let results = await waitersAppDB.getWeekDays();
         assert.equal('Monday', results[0].days_of_week);
         assert.equal('Tuesday', results[1].days_of_week);
         assert.equal('Wednesday', results[2].days_of_week);
         assert.equal('Thursday', results[3].days_of_week);
         assert.equal('Friday', results[4].days_of_week);
         assert.equal('Saturday', results[5].days_of_week);
         assert.equal('Sunday', results[6].days_of_week);
      } catch (error) {
         console.log(error); 
      }
   });

   it('It should allow the waiter to choose his/her working days that are not less than 3', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         await waitersAppDB.storeWaitersDetails('Dean', 'Ndlovu', "hyufga", '0759871456');
         let ID = await db.oneOrNone('select firstname from waiters where firstname = $1;', ['Dean']);
         await waitersAppDB.choosingOfDaysByTheWaiters(ID.id, [ '2', '3', '4' ]);
         await waitersAppDB.filterDays('1', '2', 'Dean');
         await waitersAppDB.checkWhichWaiterSelectedWhicDays();
         let results = await waitersAppDB.getWaitersSchedule();
         assert.equal(ID.id, results[0].waiters_id);
         assert.equal('2', results[0].week_days_id);
         assert.equal(ID.id, results[1].waiters_id);
         assert.equal('3', results[1].week_days_id);
         assert.equal(ID.id, results[2].waiters_id);
         assert.equal('4', results[2].week_days_id);
         await db.none('delete from waiters_schedule;');
      } catch (error) {
         console.log(error);
      }
   });

   it('It shouldn\'t allow the waiter to select days that are less than 3', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         await waitersAppDB.storeWaitersDetails('Dean', 'Ndlovu', "hyufga", '0759871456');
         let ID = await db.oneOrNone('select firstname from waiters where firstname = $1;', ['Dean']);
         await waitersAppDB.choosingOfDaysByTheWaiters(ID.id, ['2', '3']);
         await waitersAppDB.filterDays('1', '2', 'Dean');
         await waitersAppDB.checkWhichWaiterSelectedWhicDays();
         let results = await waitersAppDB.getWaitersSchedule();
         assert.equal(null, results.waiters_id);
         assert.equal(null, results.week_days_id);
         await db.none('delete from waiters_schedule;');
      } catch (error) {
         console.log(error); 
      }
   });

   it('It should filter waiters days if the waiters update his/her days', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         await waitersAppDB.storeWaitersDetails('Dean', 'Ndlovu', "hyufga", '0759871456');
         let ID = await db.oneOrNone('select firstname from waiters where firstname = $1;', ['Dean']);
         await waitersAppDB.choosingOfDaysByTheWaiters(ID.id, [ '1', '5', '6', '7' ]);
         await waitersAppDB.filterDays('1', '2', 'Dean');
         await waitersAppDB.checkWhichWaiterSelectedWhicDays();
         let results = await waitersAppDB.getWaitersSchedule();
         assert.equal(ID.id, results[0].waiters_id);
         assert.equal('1', results[0].week_days_id);
         assert.equal(ID.id, results[1].waiters_id);
         assert.equal('5', results[1].week_days_id);
         assert.equal(ID.id, results[2].waiters_id);
         assert.equal('6', results[2].week_days_id);
         assert.equal(ID.id, results[3].waiters_id);
         assert.equal('7', results[3].week_days_id);
         await db.none('delete from waiters_schedule;');
      } catch (error) {
         console.log(error); 
      }
   });

   it('Admin should be able to update waiters days', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         await waitersAppDB.storeWaitersDetails('Dean', 'Ndlovu', "hyufga", '0759871456');
         let ID = await db.oneOrNone('select firstname from waiters where firstname = $1;', ['Dean']);
         await waitersAppDB.adminToUpdateWaitersDays(ID.id, '4');
         await waitersAppDB.checkWhichWaiterSelectedWhicDays();
         let results = await waitersAppDB.getWaitersSchedule();
         assert.equal(ID.id, results[0].waiters_id);
         assert.equal('4', results[0].week_days_id);
         await db.none('delete from waiters_schedule;');
      } catch (error) {
         console.log(error); 
      }
   });

   it('Admin should be able to delete each waiters day', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         await waitersAppDB.storeWaitersDetails('Dean', 'Ndlovu', "hyufga", '0759871456');
         let ID = await db.oneOrNone('select firstname from waiters where firstname = $1;', ['Dean']);
         await waitersAppDB.choosingOfDaysByTheWaiters(ID.id, [ '1', '5', '6', '7' ]);
         await waitersAppDB.adminToClearWaitersDays(ID.id, '7');
         await waitersAppDB.checkWhichWaiterSelectedWhicDays();
         let results = await waitersAppDB.getWaitersSchedule();
         assert.equal(ID.id, results[0].waiters_id);
         assert.equal('1', results[0].week_days_id);
         assert.equal(ID.id, results[1].waiters_id);
         assert.equal('5', results[1].week_days_id);
         assert.equal(ID.id, results[2].waiters_id);
         assert.equal('6', results[2].week_days_id);
         await db.none('delete from waiters_schedule;');
      } catch (error) {
         console.log(error); 
      }
   });

   it('It should delete all schedule days of all the waiters', async function(){
      try {
         let waitersAppDB = WaitersAppDB(db);
         assert.equal(null, await waitersAppDB.deleteWaiters());
      } catch (error) {
         console.log(error); 
      }
   });
    
   after(function(){
      db.$pool.end
   });
});
