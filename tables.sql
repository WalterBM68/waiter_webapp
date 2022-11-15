CREATE TABLE waiters(
    id serial not null primary key,
    firstname text not null,
    surname text not null,
    code text not null,
    cell_number varchar(10)
);
CREATE TABLE week_days(
    id serial not null primary key,
    days_of_week text not null
);
CREATE TABLE waiters_schedule(
    id serial not null primary key,
    waiters_id int,
    week_days_id int,
    foreign key(waiters_id) references waiters(id),
    foreign key(week_days_id) references week_days(id)
);


-- INSERT INTO week_days VALUES(1, 'Monday');
-- INSERT INTO week_days VALUES(2, 'Tuesday');
-- INSERT INTO week_days VALUES(3, 'Wednesday');
-- INSERT INTO week_days VALUES(4, 'Thursday');
-- INSERT INTO week_days VALUES(5, 'Friday');
-- INSERT INTO week_days VALUES(6, 'Saturday');
-- INSERT INTO week_days VALUES(7, 'Sunday');