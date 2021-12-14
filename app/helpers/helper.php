<?php

use App\Resources\JsonApiResource;

function model($model, $connection)
{
    $filename = __DIR__ . '/../../models/' . $model . '.json';
    if (!file_exists($filename)) {
        throw new Exception('Not Found');
    }
    $definition = json_decode(file_get_contents($filename), true);
    return new JsonApiResource($connection, $definition);
}
