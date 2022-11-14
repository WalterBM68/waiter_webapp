CREATE DATABASE waiters_app;
create role waiters login password 'waiters123';
grant all privileges on database waiters_app to waiters;

-- Test
CREATE DATABASE waiters_app_tests;
create role the_waiters login password 'the_waiters123';
grant all privileges on database waiters_app_tests to the_waiters;
