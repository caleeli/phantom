<?php

$connection->exec('DROP TABLE IF EXISTS user_roles');


$connection->exec('CREATE TABLE user_roles (id INTEGER PRIMARY KEY, user_id integer, role_id integer, name , enabled )');
$statement = $connection->prepare('INSERT INTO user_roles (user_id, role_id, name, enabled) VALUES (:user_id, :role_id, :name, :enabled)');
$statement->execute(array (
  'user_id' => '1',
  'role_id' => '1',
));
$statement = $connection->prepare('INSERT INTO user_roles (user_id, role_id, name, enabled) VALUES (:user_id, :role_id, :name, :enabled)');
$statement->execute(array (
  'user_id' => '2',
  'role_id' => '1',
));
$statement = $connection->prepare('INSERT INTO user_roles (user_id, role_id, name, enabled) VALUES (:user_id, :role_id, :name, :enabled)');
$statement->execute(array (
  'user_id' => '3',
  'role_id' => '1',
));
$statement = $connection->prepare('INSERT INTO user_roles (user_id, role_id, name, enabled) VALUES (:user_id, :role_id, :name, :enabled)');
$statement->execute(array (
  'user_id' => '4',
  'role_id' => '1',
));
