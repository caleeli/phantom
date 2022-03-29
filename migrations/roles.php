<?php

$connection->exec('DROP TABLE IF EXISTS roles');


$connection->exec('CREATE TABLE roles (id INTEGER PRIMARY KEY, name varchar(64))');
$statement = $connection->prepare('INSERT INTO roles (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'Admin',
));
$statement = $connection->prepare('INSERT INTO roles (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'Director',
));
$statement = $connection->prepare('INSERT INTO roles (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'Auditor',
));
$statement = $connection->prepare('INSERT INTO roles (name) VALUES (:name)');
$statement->execute(array (
  'name' => 'Cajero',
));
