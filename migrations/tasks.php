<?php

$connection->exec('DROP TABLE IF EXISTS tasks');


$connection->exec('CREATE TABLE tasks (task_id INTEGER PRIMARY KEY, title text, body text, task_usr_id integer, status varchar(64), created_at datetime, updated_at datetime)');
