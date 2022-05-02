<?php

$connection->exec('DROP TABLE IF EXISTS notifications');


$connection->exec('CREATE TABLE notifications (id INTEGER PRIMARY KEY, user_id int, title varchar(64), message varchar(128), timeout timestamp, read boolean)');
$statement = $connection->prepare('INSERT INTO notifications (user_id, title, message, timeout, read) VALUES (:user_id, :title, :message, :timeout, :read)');
$statement->execute(array (
  'user_id' => '1',
  'title' => 'Alerta de cumplimiento',
  'message' => 'Ejecución de la actividad 1',
  'timeout' => '1652652000',
  'read' => '0',
));
