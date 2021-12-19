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

function currency($number)
{
    return 'Bs. ' . number_format($number, 2);
}

function percentage($number)
{
    return number_format($number * 100, 2) . '%';
}

const CHART_COLORS = [
    '#add8e6',
    '#90ee90',
    '#fa8072',
    '#ffff00',
];

function donut($data, $title, $labelCol, $valueCol)
{
    return [
        'type' => "doughnut",
        'data' => [
            'labels' => array_map(function ($row) use ($labelCol) {
                return $row[$labelCol];
            }, $data),
            'datasets' => [[
                'data' => array_map(function ($row) use ($valueCol) {
                    return $row[$valueCol];
                }, $data),
                'backgroundColor' => CHART_COLORS,
                'hoverOffset' => 4,
            ]],
        ],
        'options' => [
            'plugins' => [
                'title' => [
                    'display' => true,
                    'text' => $title,
                ],
            ],
        ],
    ];
}

function doughnut(...$params)
{
    return donut(...$params);
}


function line($data, $title, $labelCol, array $valueCols)
{
    return [
        'type' => "line",
        'data' => [
            'labels' => array_map(function ($row) use ($labelCol) {
                return $row[$labelCol];
            }, $data),
            'datasets' => array_map(function ($valueCol, $index) use ($data) {
                return [
                    'label' => $valueCol,
                    'data' => array_map(function ($row) use ($valueCol) {
                        return $row[$valueCol];
                    }, $data),
                    'fill' => true,
                    'borderColor' => CHART_COLORS[$index],
                    'backgroundColor' => CHART_COLORS[$index] . '80',
                    'tension' => 0.1,
                ];
            }, $valueCols, range(0, count($valueCols) - 1)),
        ],
        'options' => [
            'plugins' => [
                'title' => [
                    'display' => true,
                    'text' => $title,
                ],
            ],
        ],
    ];
}
