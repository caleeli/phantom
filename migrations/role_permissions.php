<?php

$connection->exec('DROP TABLE IF EXISTS role_permissions');


$connection->exec('CREATE TABLE role_permissions (id INTEGER PRIMARY KEY, role_id integer, permission_id integer)');
$statement = $connection->prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)');
$statement->execute(array (
  'role_id' => '1',
  'permission_id' => '1',
));
$statement = $connection->prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)');
$statement->execute(array (
  'role_id' => '1',
  'permission_id' => '2',
));
$statement = $connection->prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)');
$statement->execute(array (
  'role_id' => '1',
  'permission_id' => '3',
));
$statement = $connection->prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)');
$statement->execute(array (
  'role_id' => '1',
  'permission_id' => '4',
));
$statement = $connection->prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)');
$statement->execute(array (
  'role_id' => '1',
  'permission_id' => '5',
));
$statement = $connection->prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)');
$statement->execute(array (
  'role_id' => '1',
  'permission_id' => '6',
));
$statement = $connection->prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)');
$statement->execute(array (
  'role_id' => '1',
  'permission_id' => '7',
));
