<?php

$connection->exec('DROP TABLE IF EXISTS sessions');


$connection->exec('CREATE TABLE sessions ( token char(128) primary key, user_id integer, username text, created_at datetime)');
