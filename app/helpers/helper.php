<?php

use App\Resources\EndpointResource;
use App\Resources\JsonApiResource;

/**
 * Get a resource model
 *
 * @param string $model
 * @param PDO $connection
 *
 * @return JsonApiResource|EndpointResource
 */
function model($model, $connection)
{
    $filename = __DIR__ . '/../../models/' . $model . '.json';
    if (!file_exists($filename)) {
        throw new Exception('Not Found');
    }
    $definition = json_decode(file_get_contents($filename), true);
    $class = 'App\Resources\\' . $definition['class'] . 'Resource';
    return new $class($connection, $definition);
}

function dateTimeInterval(string $interval): DateTime
{
    $date = new DateTime();
    $sign = substr($interval, 0, 1);
    if ($sign === '+') {
        $date->add(new DateInterval(substr($interval, 1)));
    } elseif ($sign === '-') {
        $date->sub(new DateInterval(substr($interval, 1)));
    } elseif ($sign === 'P') {
        $date->add(new DateInterval(substr($interval, 1)));
    }
    return $date;
}

function today($interval = '')
{
    return dateTimeInterval($interval)->format('Y-m-d');
}

function now($interval = '')
{
    return dateTimeInterval($interval)->format('Y-m-d H:i:s');
}


function timestamp($interval = '')
{
    return dateTimeInterval($interval)->getTimestamp();
}
