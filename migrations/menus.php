<?php

$connection->exec('CREATE TABLE menus (id INTEGER PRIMARY KEY, name varchar(64), permission varchar(64), icon varchar(64))');
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon) VALUES (:name, :permission, :icon)');
$statement->execute(array (
  'name' => 'Cuadro de Mando',
  'permission' => 'cuadro de mando',
  'icon' => 'tachometer-alt',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon) VALUES (:name, :permission, :icon)');
$statement->execute(array (
  'name' => 'Cajas',
  'permission' => 'cajas',
  'icon' => 'cash-register',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon) VALUES (:name, :permission, :icon)');
$statement->execute(array (
  'name' => 'Clientes',
  'permission' => 'clientes',
  'icon' => 'user-tie',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon) VALUES (:name, :permission, :icon)');
$statement->execute(array (
  'name' => 'Créditos',
  'permission' => 'creditos',
  'icon' => 'credit-card',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon) VALUES (:name, :permission, :icon)');
$statement->execute(array (
  'name' => 'Usuarios',
  'permission' => 'usuarios',
  'icon' => 'users',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon) VALUES (:name, :permission, :icon)');
$statement->execute(array (
  'name' => 'Perfil',
  'permission' => 'perfil',
  'icon' => 'user',
));
