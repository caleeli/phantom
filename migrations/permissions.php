<?php

$connection->exec('DROP TABLE IF EXISTS permissions');


$connection->exec('CREATE TABLE permissions (id INTEGER PRIMARY KEY, name text)');
$statement = $connection->prepare('INSERT INTO permissions (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'cuadro de mando',
));
$statement = $connection->prepare('INSERT INTO permissions (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'cajas',
));
$statement = $connection->prepare('INSERT INTO permissions (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'clientes',
));
$statement = $connection->prepare('INSERT INTO permissions (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'creditos',
));
$statement = $connection->prepare('INSERT INTO permissions (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'usuarios',
));
$statement = $connection->prepare('INSERT INTO permissions (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'perfil',
));
$statement = $connection->prepare('INSERT INTO permissions (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'plan anual',
));
