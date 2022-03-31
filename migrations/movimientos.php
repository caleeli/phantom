<?php

$connection->exec('DROP TABLE IF EXISTS movimientos');


$connection->exec('CREATE TABLE movimientos (id INTEGER PRIMARY KEY, informe_id varchar(64), cuenta varchar(64), documento varchar(64), comprobante varchar(64), fecha date, debito numeric, credito numeric, detalle text)');
