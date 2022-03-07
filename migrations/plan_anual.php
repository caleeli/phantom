<?php

$connection->exec('DROP TABLE IF EXISTS plan_anual');


$connection->exec('CREATE TABLE plan_anual (id INTEGER PRIMARY KEY, objetivo text, indicador text, meta varchar(64), actividad text, periodo text)');
$statement = $connection->prepare('INSERT INTO plan_anual (objetivo, indicador, meta, actividad, periodo) VALUES (:objetivo, :indicador, :meta, :actividad, :periodo)');
$statement->execute(array (
  'objetivo' => 'Objetivo 1',
  'indicador' => 'porcentaje 1',
  'meta' => '100%',
  'actividad' => 'Completar el porcentaje de uno',
  'periodo' => 'enero,febrero',
));
$statement = $connection->prepare('INSERT INTO plan_anual (objetivo, indicador, meta, actividad, periodo) VALUES (:objetivo, :indicador, :meta, :actividad, :periodo)');
$statement->execute(array (
  'objetivo' => 'Objetivo 1',
  'indicador' => 'valor 2',
  'meta' => '5.6',
  'actividad' => 'Subir el valor de dos a 5.6',
  'periodo' => 'febrero,marzo',
));
