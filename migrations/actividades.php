<?php

$connection->exec('DROP TABLE IF EXISTS actividades');


$connection->exec('CREATE TABLE actividades (id INTEGER PRIMARY KEY, plan_anual_id integer, objetivo text, actividad text, indicador varchar(64), meta text, periodo text, responsable_id varchar(64), responsable varchar(64))');
$statement = $connection->prepare('INSERT INTO actividades (plan_anual_id, objetivo, actividad, indicador, meta, periodo, responsable_id, responsable) VALUES (:plan_anual_id, :objetivo, :actividad, :indicador, :meta, :periodo, :responsable_id, :responsable)');
$statement->execute(array (
  'objetivo' => '1. Objetivo Principal',
  'indicador' => 'porcentaje 1',
  'meta' => '100%',
  'actividad' => '1.1. Completar el porcentaje de uno',
  'periodo' => 'enero,febrero',
  'responsable_id' => '1',
  'responsable' => 'Juan Perez',
  'plan_anual_id' => '1',
));
$statement = $connection->prepare('INSERT INTO actividades (plan_anual_id, objetivo, actividad, indicador, meta, periodo, responsable_id, responsable) VALUES (:plan_anual_id, :objetivo, :actividad, :indicador, :meta, :periodo, :responsable_id, :responsable)');
$statement->execute(array (
  'objetivo' => '1. Objetivo Principal',
  'indicador' => 'valor 2',
  'meta' => '5.6',
  'actividad' => '1.2. Subir el valor de dos a 5.6',
  'periodo' => 'febrero,marzo',
  'responsable_id' => '2',
  'responsable' => 'Maria Gonzales',
  'plan_anual_id' => '1',
));
