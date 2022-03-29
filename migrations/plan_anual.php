<?php

$connection->exec('DROP TABLE IF EXISTS plan_anual');


$connection->exec('CREATE TABLE plan_anual (id INTEGER PRIMARY KEY, objetivo text, actividad text, indicador varchar(64), meta text, periodo text, responsable_id varchar(64), responsable varchar(64))');
$statement = $connection->prepare('INSERT INTO plan_anual (objetivo, actividad, indicador, meta, periodo, responsable_id, responsable) VALUES (:objetivo, :actividad, :indicador, :meta, :periodo, :responsable_id, :responsable)');
$statement->execute(array (
  'objetivo' => 'Objetivo 1',
  'indicador' => 'porcentaje 1',
  'meta' => '100%',
  'actividad' => 'Completar el porcentaje de uno',
  'periodo' => 'enero,febrero',
  'responsable_id' => '1',
  'responsable' => 'Juan Perez',
));
$statement = $connection->prepare('INSERT INTO plan_anual (objetivo, actividad, indicador, meta, periodo, responsable_id, responsable) VALUES (:objetivo, :actividad, :indicador, :meta, :periodo, :responsable_id, :responsable)');
$statement->execute(array (
  'objetivo' => 'Objetivo 1',
  'indicador' => 'valor 2',
  'meta' => '5.6',
  'actividad' => 'Subir el valor de dos a 5.6',
  'periodo' => 'febrero,marzo',
  'responsable_id' => '2',
  'responsable' => 'Maria Gonzales',
));
