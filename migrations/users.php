<?php

$connection->exec('DROP TABLE IF EXISTS users');


$connection->exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name varchar(64), username varchar(64), avatar varchar(64), email varchar(64), phone varchar(64), status varchar(64), password varchar(64))');
$statement = $connection->prepare('INSERT INTO users (name, username, avatar, email, phone, status, password) VALUES (:name, :username, :avatar, :email, :phone, :status, :password)');
$statement->execute(array (
  'name' => 'Juan Perez',
  'username' => 'juan',
  'avatar' => 'images/avatar/avatar-1.jpg',
  'email' => 'juan@example.com',
  'phone' => '555-555-55',
  'status' => 'ACTIVE',
  'password' => '5f4dcc3b5aa765d61d8327deb882cf99',
));
$statement = $connection->prepare('INSERT INTO users (name, username, avatar, email, phone, status, password) VALUES (:name, :username, :avatar, :email, :phone, :status, :password)');
$statement->execute(array (
  'name' => 'Maria Gonzales',
  'username' => 'maria',
  'avatar' => 'images/avatar/avatar-1.jpg',
  'email' => 'maria@example.com',
  'phone' => '555-555-55',
  'status' => 'ACTIVE',
  'password' => '5f4dcc3b5aa765d61d8327deb882cf99',
));
$statement = $connection->prepare('INSERT INTO users (name, username, avatar, email, phone, status, password) VALUES (:name, :username, :avatar, :email, :phone, :status, :password)');
$statement->execute(array (
  'name' => 'Cesar Ferine',
  'username' => 'cesar',
  'avatar' => 'images/avatar/avatar-1.jpg',
  'email' => 'cesar@example.com',
  'phone' => '555-555-55',
  'status' => 'ACTIVE',
  'password' => '5f4dcc3b5aa765d61d8327deb882cf99',
));
