
module.exports = function waitersAppDB(db){
    const storeWaitersDetails = async (firstname, surname, code) => {
        const name = await db.oneOrNone('select * from waiters where firstname = $1;', [firstname]);
        if(name === null){
            await db.none('insert into waiters (firstname, surname, code) values ($1, $2, $3);', [firstname, surname, code]);
        }
    }
    const checkWaitersName = async (firstname) => {
        const waiter = await db.oneOrNone('select count(*) from waiters where firstname = $1;', [firstname]);
        return waiter;
    }
    const getTheUniqueCode = async (theCode) => {
        const code = await db.oneOrNone('select * from waiters where code = $1;', [theCode]);
        return code;
    }
    const getWaitersDatails = async () => {
        const allWaiters = await db.manyOrNone('select * from waiters;');
        return allWaiters;
    }
    const getWeekDays = async () => {
        const days = await db.manyOrNone('select * from week_days;');
        return days;
    }
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
    const filterDays = async (waitersId, weekDaysId, waitersName) => {
        const waiterID = await db.oneOrNone('select id from waiters where firstname = $1;', [waitersName]);
        const theWeekDays = await db.manyOrNone('select week_days_id from waiters_schedule where waiters_id = $1;', [waiterID.id]);
        const databaseArray = theWeekDays.map(object => object.week_days_id);
        let toFilterTheDays = databaseArray.filter(item => !weekDaysId.includes(item.toString()));
        for(let i = 0; i < toFilterTheDays.length; i++){
            const waitersDays = await db.none('delete from waiters_schedule where waiters_id = $1 AND week_days_id = $2;', [waitersId, toFilterTheDays[i]]);
        }
    }
    const showDays = async (waiterID) => {
        const scheduleOfWaiters = await db.manyOrNone(`select * from waiters_schedule 
            join week_days
                on waiters_schedule.week_days_id = week_days.id
            join waiters
                on waiters.id = waiters_schedule.waiters_id
            where waiters.id = $1;`, [waiterID]);
        return scheduleOfWaiters;
    }
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
        showDays,
        deleteWaiters
    }
}