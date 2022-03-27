<?php

$connection->exec('DROP TABLE IF EXISTS plan_anual');


$connection->exec('CREATE TABLE plan_anual (id INTEGER PRIMARY KEY, objetivo text, actividad text, indicador varchar(64), meta text, periodo text)');
$statement = $connection->prepare('INSERT INTO plan_anual (objetivo, actividad, indicador, meta, periodo) VALUES (:objetivo, :actividad, :indicador, :meta, :periodo)');
$statement->execute(array (
  'objetivo' => 'Objetivo 1',
  'indicador' => 'porcentaje 1',
  'meta' => '100%',
  'actividad' => 'Completar el porcentaje de uno',
  'periodo' => 'enero,febrero',
));
$statement = $connection->prepare('INSERT INTO plan_anual (objetivo, actividad, indicador, meta, periodo) VALUES (:objetivo, :actividad, :indicador, :meta, :periodo)');
$statement->execute(array (
  'objetivo' => 'Objetivo 1',
  'indicador' => 'valor 2',
  'meta' => '5.6',
  'actividad' => 'Subir el valor de dos a 5.6',
  'periodo' => 'febrero,marzo',
));
