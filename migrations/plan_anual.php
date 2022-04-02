<?php

$connection->exec('DROP TABLE IF EXISTS plan_anual');


$connection->exec('CREATE TABLE plan_anual (id INTEGER PRIMARY KEY, titulo varchar(64), periodo varchar(64), elaborado_por_id integer, elaborado_por varchar(64), fecha varchar(64), referencia varchar(64))');
