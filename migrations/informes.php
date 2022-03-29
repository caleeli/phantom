<?php

$connection->exec('DROP TABLE IF EXISTS informes');


$connection->exec('CREATE TABLE informes (id INTEGER PRIMARY KEY, entidad varchar(64), elaborado_por_id integer, elaborado_por varchar(64), fecha varchar(64), referencia varchar(64))');
