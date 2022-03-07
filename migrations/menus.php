<?php

$connection->exec('DROP TABLE IF EXISTS menus');


$connection->exec('CREATE TABLE menus (id INTEGER PRIMARY KEY, name varchar(64), permission varchar(64), icon varchar(64), href varchar(64))');
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon, href) VALUES (:name, :permission, :icon, :href)');
$statement->execute(array (
  'name' => 'Cuadro de Mando',
  'permission' => 'cuadro de mando',
  'icon' => 'tachometer-alt',
  'href' => '/dashboard',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon, href) VALUES (:name, :permission, :icon, :href)');
$statement->execute(array (
  'name' => 'Cajas',
  'permission' => 'cajas',
  'icon' => 'cash-register',
  'href' => '/cajas',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon, href) VALUES (:name, :permission, :icon, :href)');
$statement->execute(array (
  'name' => 'Clientes',
  'permission' => 'clientes',
  'icon' => 'user-tie',
  'href' => '/clientes',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon, href) VALUES (:name, :permission, :icon, :href)');
$statement->execute(array (
  'name' => 'Créditos',
  'permission' => 'creditos',
  'icon' => 'credit-card',
  'href' => '/creditos',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon, href) VALUES (:name, :permission, :icon, :href)');
$statement->execute(array (
  'name' => 'Usuarios',
  'permission' => 'usuarios',
  'icon' => 'users',
  'href' => '/admin/users',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon, href) VALUES (:name, :permission, :icon, :href)');
$statement->execute(array (
  'name' => 'Perfil',
  'permission' => 'perfil',
  'icon' => 'user',
  'href' => '/admin/profile',
));
$statement = $connection->prepare('INSERT INTO menus (name, permission, icon, href) VALUES (:name, :permission, :icon, :href)');
$statement->execute(array (
  'name' => 'Plan Anual',
  'permission' => 'plan anual',
  'icon' => 'calendar',
  'href' => '/plan_anual',
));
