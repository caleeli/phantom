<?php

use App\Exceptions\AuthorizationException;
use App\Resources\EndpointResource;
use App\Resources\JsonApiResource;
use Workerman\Protocols\Http\Request;

/**
 * Get a resource model
 *
 * @param string $model
 * @param PDO $connection
 *
 * @return JsonApiResource|EndpointResource
 */
function model($model, $connection = null, Request $request)
{
    $connection = $connection ?: $GLOBALS['connection'];
    $class = 'App\Resources\\' . ucwords($model) . 'Resource';
    if (class_exists($class)) {
        return new $class($connection, [], $request);
    }
    $filename = __DIR__ . '/../../models/' . $model . '.json';
    if (!file_exists($filename)) {
        throw new Exception('Not Found');
    }
    $definition = json_decode(file_get_contents($filename), true);
    $definition['name'] = $model;
    $class = 'App\Resources\\' . $definition['class'] . 'Resource';
    return new $class($connection, $definition, $request);
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

/**
 * Convert text to sql like pattern
 *
 * @param string $text
 *
 * @return string
 */
function contains($text)
{
    $text = preg_replace('/\s+/', '%', $text);
    $text = preg_replace('/[^\s\w%]/', '_', $text);
    return '%' . $text . '%';
}

function startsWith($text)
{
    $text = preg_replace('/\s+/', '%', $text);
    $text = preg_replace('/[^\s\w%]/', '_', $text);
    return $text . '%';
}

const CHART_COLORS = [
    '#add8e6',
    '#90ee90',
    '#fa8072',
    '#ffff00',
];

function donut($data, $title, $labelCol, $valueCol, $tplOptions = [])
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
        'tplOptions' => (object) $tplOptions,
    ];
}

function doughnut(...$params)
{
    return donut(...$params);
}


function line($data, $title, $labelCol, array $valueCols, $tplOptions = [])
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
        'tplOptions' => (object) $tplOptions,
    ];
}

/**
 * Login from request
 *
 * @param Request $request
 */
function login(Request $request)
{
    $authorization = $request->header('Authorization');
    // starts with 'Bearer '
    if (strlen($authorization) > 7 && substr($authorization, 0, 7) === 'Bearer ') {
        session($request, substr($authorization, 7));
    }
}

/**
 * Get session from request
 */
function session(Request $request, $token = null)
{
    global $connection;
    if ($token) {
        try {
            $session = model('sessions', $connection, $request)->show($token)['data'];
            $request->session = (object) $session['attributes'];
            $request->user_id = $request->session->user_id;
        } catch (Exception $e) {
            throw new AuthorizationException($e);
        }
    }
    if (!$request->session) {
        throw new AuthorizationException();
    }
    return $request->session;
}

function logged_permissions(Request $request)
{
    global $connection;
    $model = model('user_permissions', $connection, $request);
    $permissions = $model->index(['id' => session($request)->id]);
    $permissions = array_map(function ($permission) {
        return $permission['attributes']['name'];
    }, $permissions['data']);
    return $permissions;
}

function run_migrations($name = '', array &$skip=[])
{
    global $connection;
    foreach (glob('migrations/*.php') as $file) {
        if (empty($name) || basename($file, '.php') === $name) {
            // reset file stat
            clearstatcache(true, $file);
            $hash = md5_file($file);
            if (in_array($hash, $skip)) {
                error_log("SKIP: " . basename($file, '.php'));
                continue;
            }
            error_log("MIGRATE: " . basename($file, '.php'));
            $skip[basename($file, '.php')] = $hash;
            require $file;
        }
    }
}

// /**
//  * Replace :variables in text string
//  *
//  * @param array $text
//  * @param string $params
//  *
//  * @return string
//  */
// function _($text, $params)
// {
//     return preg_replace_callback('/:([a-zA-Z0-9_]+)/', function ($matches) use ($params) {
//         return $params[$matches[1]];
//     }, $text);
// }
