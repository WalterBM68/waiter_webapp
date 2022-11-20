
module.exports = function waitersAppDB(db){
    
    //Store waiters details to the table when they register
    const storeWaitersDetails = async (firstname, surname, code, numberPhone) => {
        try {
            const name = await db.oneOrNone('select * from waiters where firstname = $1;', [firstname]);
            if(name === null){
                await db.none('insert into waiters (firstname, surname, code, cell_number) values ($1, $2, $3, $4);', [firstname, surname, code, numberPhone]);
            }    
        } catch (error) {
           console.log(error);
        }
    }

    //Check if the waiter's name is already in the table or not
    const checkWaitersName = async (firstname) => {
        try {
            const waiter = await db.oneOrNone('select count(*) from waiters where firstname = $1;', [firstname]);
            return waiter;  
        } catch (error) {
            console.log(error);
        }
    }

    //Get the unique code
    const getTheUniqueCode = async (theCode) => {
        try {
            const code = await db.oneOrNone('select * from waiters where code = $1;', [theCode]);
            return code;    
        } catch (error) {
            console.log(error);
        }
    }

    //Get all waiters that have registered
    const getWaitersDatails = async () => {
        try {
            const allWaiters = await db.manyOrNone('select * from waiters;');
            return allWaiters;    
        } catch (error) {
            console.log(error);
        }
    }

    //Get all the week days from the table
    const getWeekDays = async () => {
        try {
            const days = await db.manyOrNone('select * from week_days;');
            return days;    
        } catch (error) {
            console.log(error);
        }
    }

    //Waiters to choose their working days
    const choosingOfDaysByTheWaiters = async (waitersId, weekDaysId) => {
        try {
            for(let i = 0; i < weekDaysId.length; i++){
                let count = await db.manyOrNone('select count(*) from waiters_schedule where waiters_id = $1 AND week_days_id = $2;', [waitersId, weekDaysId[i]]);
                let countWaitersAndDays = count.map(waiter => waiter.count);
                let insertCount = countWaitersAndDays.toString();
                if(insertCount == 0 && weekDaysId.length >= 3){
                    await db.none('insert into waiters_schedule (waiters_id, week_days_id) values ($1, $2);', [waitersId, weekDaysId[i]]);
                }
            }  
        } catch (error) {
            console.log(error);
        }
    }

    // filter the days of the waiters & don't allow waiter to choose less than 3 days
    const filterDays = async (waitersId, weekDaysId, waitersName) => {
        try {
            const waiterID = await db.oneOrNone('select id from waiters where firstname = $1;', [waitersName]);
            const theWeekDays = await db.manyOrNone('select week_days_id from waiters_schedule where waiters_id = $1;', [waiterID.id]);
            const listOfWeekdays = theWeekDays.map(daysOfTheWeek => daysOfTheWeek.week_days_id);
            let filterWeekDays = listOfWeekdays.filter(days => !weekDaysId.includes(days.toString()));
            for(let i = 0; i < filterWeekDays.length; i++){
                await db.none('delete from waiters_schedule where waiters_id = $1 AND week_days_id = $2;', [waitersId, filterWeekDays[i]]);
            }    
        } catch (error) {
            console.log(error);
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


    //Allow the admin to update the waiters days
    const adminToUpdateWaitersDays = async (waitersID, weekDaysId) => {
        try {
            let count = await db.manyOrNone('select count(*) from waiters_schedule where waiters_id = $1 AND week_days_id = $2;', [waitersID, weekDaysId]);
            let waitersCounts = count.map(waiter => waiter.count);
            let insertCount = waitersCounts.toString();
            if(insertCount == 0){
                await db.none('insert into waiters_schedule (waiters_id, week_days_id) values ($1, $2);', [waitersID, weekDaysId]);
            }   
        } catch (error) {
            console.log(error);
        }
    }

    //Admin to delete each waiters day
    const adminToClearWaitersDays = async (waitersID, weekDaysId) => {
        try {
            let count = await db.manyOrNone('select week_days_id from waiters_schedule where waiters_id = $1;', [waitersID]);
            if(count.length >= 4){
                const waitersDays = await db.none('delete from waiters_schedule where waiters_id = $1 AND week_days_id = $2;', [waitersID, weekDaysId]);
            }    
        } catch (error) {
            console.log(error);
        }
    }

    //Changing the colors of the days based on waiters availability on that day
    const changeDaysColors = async () => {
        try {
            let insertCount;
            let weekdaysColor;
            let allTheDays = [];
            const daysIds = await db.manyOrNone('select id from week_days;');
            for(let i = 0; i < daysIds.length; i++){
                let countOfWeekdays = await db.manyOrNone('select count(*) from waiters_schedule where week_days_id = $1;', [Number(daysIds[i].id)]);
                let weekdaysCounts = countOfWeekdays.map(waiter => waiter.count);
                insertCount = Number(weekdaysCounts.toString());
                weekdaysColor = insertCount < 3 ? 'orange' : insertCount == 3 ? 'green' : insertCount > 3 ? 'red' : '';
                allTheDays.push(weekdaysColor);
            }
            let daysOfTheWeek = await db.manyOrNone('select days_of_week from week_days;');
            let changingArrayToObject = allTheDays.map(color => ({color}));
            const results = changingArrayToObject.map((changingArrayToObject, index) => 
                ({...changingArrayToObject, ...daysOfTheWeek[index]})
            );
            return results;   
        } catch (error) {
            console.log(error);
        }
    }

    //Keeping the checkboxes checked
    const keepTheCheckboxesChecked = async (waitersDays) => {
        try {
            let theDaysOfTheWeek;
            let listOfDays = [];
            let daysOfWaiter = await db.manyOrNone('select week_days_id from waiters_schedule where  waiters_id = $1;', [waitersDays]);
            let selectedDays = daysOfWaiter.map(waiter => waiter.week_days_id);
            let thedays = await db.manyOrNone('select id from week_days;');
            let allDays = thedays.map(waiter => waiter.id);
            for(let i = 0; i < allDays.length; i++){
                theDaysOfTheWeek = selectedDays.includes(allDays[i]) ? 'checked' : 'unchecked';
                listOfDays.push(theDaysOfTheWeek);
            }
            let changeArrayToObject = listOfDays.map(check => ({check}));
            return changeArrayToObject;   
        } catch (error) {
            console.log(error);
        }
    } 

    //Select days that were choosen by the waiters
    const getWaitersSchedule = async () => {
        try {
            const scheduledDays = await db.manyOrNone('select * from waiters_schedule;');
            return scheduledDays;   
        } catch (error) {
            console.log(error);
        }
    }

    //Select waiters schedule days
    const checkWhichWaiterSelectedWhicDays = async () => {
        try {
            const waitersAndDays = await db.manyOrNone('select * from waiters_schedule;');
            return waitersAndDays;    
        } catch (error) {
            console.log(error);
        }
    }

    //Delete waiters details
    const clearWaitersDetails = async () => {
        try {
            const detailsOfWaiters = await db.none("delete from waiters;");
            return detailsOfWaiters;  
        } catch (error) {
            console.log(error);
        }
    }

    //Delete all the days the waiter has selected
    const deleteWaiters = async () =>{
        try {
            await db.none('delete from waiters_schedule;');
            await db.none("delete from waiters;");         
        } catch (error) {
            console.log(error);
        }
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
        adminToClearWaitersDays,
        adminToUpdateWaitersDays,
        checkWhichWaiterSelectedWhicDays,
        keepTheCheckboxesChecked,
        changeDaysColors,
        getWaitersSchedule,
        clearWaitersDetails,
        deleteWaiters
    }
}
