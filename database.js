
module.exports = function waitersAppDB(db){
    //Store waiters details to the table when they register
    const storeWaitersDetails = async (firstname, surname, code) => {
        const name = await db.oneOrNone('select * from waiters where firstname = $1;', [firstname]);
        if(name === null){
            await db.none('insert into waiters (firstname, surname, code) values ($1, $2, $3);', [firstname, surname, code]);
        }
    }
    //Check if the waiter's name is already in the table or not
    const checkWaitersName = async (firstname) => {
        const waiter = await db.oneOrNone('select count(*) from waiters where firstname = $1;', [firstname]);
        return waiter;
    }
    //Get the unique code
    const getTheUniqueCode = async (theCode) => {
        const code = await db.oneOrNone('select * from waiters where code = $1;', [theCode]);
        return code;
    }
    //Get all waiters that have registered
    const getWaitersDatails = async () => {
        const allWaiters = await db.manyOrNone('select * from waiters;');
        return allWaiters;
    }
    //Get all the week days from the table
    const getWeekDays = async () => {
        const days = await db.manyOrNone('select * from week_days;');
        return days;
    }
    //Insert the working days of the waiters to the table
    const choosingOfDaysByTheWaiters = async (waitersId, weekDaysId) => {
        for(let i = 0; i < weekDaysId.length; i++){
            let count = await db.manyOrNone('select count(*) from waiters_schedule where waiters_id = $1 AND week_days_id = $2;', [waitersId, weekDaysId[i]]);
            let my_counts = count.map(a => a.count);
            let insertCount = my_counts.toString();
            if(insertCount == 0 && weekDaysId.length >= 3){
                await db.none('insert into waiters_schedule (waiters_id, week_days_id) values ($1, $2);', [waitersId, weekDaysId[i]]);
            }
        }
    }
    // filter the days of the waiters & don't allow waiter to choose less than 3 days
    const filterDays = async (waitersId, weekDaysId, waitersName) => {
        const waiterID = await db.oneOrNone('select id from waiters where firstname = $1;', [waitersName]);
        const theWeekDays = await db.manyOrNone('select week_days_id from waiters_schedule where waiters_id = $1;', [waiterID.id]);
        const databaseArray = theWeekDays.map(object => object.week_days_id);
        let toFilterTheDays = databaseArray.filter(item => !weekDaysId.includes(item.toString()));
        for(let i = 0; i < toFilterTheDays.length; i++){
            const waitersDays = await db.none('delete from waiters_schedule where waiters_id = $1 AND week_days_id = $2;', [waitersId, toFilterTheDays[i]]);
        }
    }
    //Show the names of the waiters that selected their working days
    const ShowWaiterThatSelectedTheDays = async () => {
        let allTheNamesOfTheWaiters = [];
        let waitersWhoSeletedTheirDays = {};
        let theFisrtNameOfWaiter = await db.manyOrNone(`select firstname, days_of_week, week_days_id from waiters join waiters_schedule on waiters.id = waiters_schedule.waiters_id join week_days on waiters_schedule.week_days_id = week_days.id`);
        let Monday = [];
        let Tuesday = [];
        let Wednesday = [];
        let Thursday = [];
        let Friday = [];
        let Saturday = [];
        let Sunday = [];
        theFisrtNameOfWaiter.forEach(element => {
            if(element.days_of_week === 'Monday'){
                Monday.push(element.firstname);
            }
            if(element.days_of_week === 'Tuesday'){
                Tuesday.push(element.firstname);
            }
            if(element.days_of_week === 'Wednesday'){
                Wednesday.push(element.firstname);
            }
            if(element.days_of_week === 'Thursday'){
                Thursday.push(element.firstname);
            }
            if(element.days_of_week === 'Friday'){
                Friday.push(element.firstname);
            }
            if(element.days_of_week === 'Saturday'){
                Saturday.push(element.firstname);
            }
            if(element.days_of_week === 'Sunday'){
                Sunday.push(element.firstname);
            }
        });
        if(waitersWhoSeletedTheirDays['Monday'] === undefined){
            waitersWhoSeletedTheirDays['Monday'] = Monday;
        }
        if(waitersWhoSeletedTheirDays['Tuesday'] === undefined){
            waitersWhoSeletedTheirDays['Tuesday'] = Tuesday;
        }
        if(waitersWhoSeletedTheirDays['Wednesday'] === undefined){
            waitersWhoSeletedTheirDays['Wednesday'] = Wednesday;
        }
        if(waitersWhoSeletedTheirDays['Thursday'] === undefined){
            waitersWhoSeletedTheirDays['Thursday'] = Thursday;
        }
        if(waitersWhoSeletedTheirDays['Friday'] === undefined){
            waitersWhoSeletedTheirDays['Friday'] = Friday;
        }
        if(waitersWhoSeletedTheirDays['Saturday'] === undefined){
            waitersWhoSeletedTheirDays['Saturday'] = Saturday;
        }
        if(waitersWhoSeletedTheirDays['Sunday'] === undefined){
            waitersWhoSeletedTheirDays['Sunday'] = Sunday;
        }
        allTheNamesOfTheWaiters.push(waitersWhoSeletedTheirDays);
        return allTheNamesOfTheWaiters;
    }
    //Keep the days that the waiter selected checked
    const keepTheSelectedDaysChecked = async () => {
        let Monday;
        let Tuesday;
        let Wednesday;
        let Thursday;
        let Friday;
        let Saturday;
        let Sunday;
    }
    //Allow the admin to reschedule the waiters days
    const adminToRescheduleWaiters = async () => {

    }
    //Delete all the days the waiter has selected
    const deleteWaiters = async () =>{
        const toDeleteAllWaiters = await db.none('delete from waiters_schedule;');
        return toDeleteAllWaiters;
    }
    return{
        storeWaitersDetails,
        checkWaitersName,
        getTheUniqueCode,
        getWaitersDatails,
        getWeekDays,
        choosingOfDaysByTheWaiters,
        filterDays,
        ShowWaiterThatSelectedTheDays,
        keepTheSelectedDaysChecked,
        adminToRescheduleWaiters,
        deleteWaiters
    }
}