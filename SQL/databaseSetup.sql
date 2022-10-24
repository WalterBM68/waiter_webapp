postgres=# CREATE DATABASE waiters_app;
postgres=# create role waiters login password 'waiters123';
postgres=# grant all privileges on database waiters_app to waiters;
