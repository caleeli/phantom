<?php

$connection->exec('DROP TABLE IF EXISTS resultados');


$connection->exec('CREATE TABLE resultados (id INTEGER PRIMARY KEY, actividad_id integer, resultado_esperado text, avance integer, medio text, resultado varchar(64), verificacion varchar(64))');
