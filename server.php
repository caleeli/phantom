<?php
require 'vendor/autoload.php';

use App\DevTools\DevTools;
use App\Exceptions\AuthorizationException;
use Mark\App;
use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;

// catch errors
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    throw new Exception($errstr, $errno);
});

$env = parse_ini_file('.env');
// add to $_ENV
foreach ($env as $key => $value) {
    $_ENV[$key] = $value;
}

$api = new App($env['api_base']);

const base_headers = [
    'Content-Type' => 'application/json',
    'Access-Control-Allow-Origin'      => '*',
    'Access-Control-Allow-Credentials' => 'true',
    'Access-Control-Allow-Methods'     => 'GET,POST,PUT,DELETE',
    'Access-Control-Allow-Headers' => 'Content-Type,Authorization,X-Requested-With',
    'Server' => 'Phantom',
];

$connection = new PDO($env['dns'], $env['user'], $env['password']);
$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$api->options('/api/{model}/{id}', function (Request $request) {
    return new Response(201, base_headers, '');
});
$api->options('/api/{model}', function (Request $request) {
    return new Response(201, base_headers, '');
});
$api->options('/api/report/{model}/{id}', function (Request $request) {
    return new Response(201, base_headers, '');
});

$api->get('/api/{model}/{id}', function (Request $request, $model, $id) use ($connection) {
    try {
        $resource = model($model, $connection, $request);
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $options = $request->get(null, []);
        $include = $request->get('include', '');
        $include = $include ? explode(',', $include) : [];
        $options['include'] = $include;
        return new Response(200, base_headers, json_encode($resource->show($id, $options)));
    } catch (Exception $e) {
        return new Response(500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->get('/api/report/{model}/{id}', function (Request $request, $model, $id) use ($connection) {
    try {
        $resource = model($model, $connection, $request);
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $options = $request->get(null, []);
        $include = $request->get('include', '');
        $include = $include ? explode(',', $include) : [];
        $options['include'] = $include;
        return new Response(200, base_headers, json_encode($resource->report($id, $options)));
    } catch (Exception $e) {
        error_log($e->getMessage());
        error_log($e->getTraceAsString());
        return new Response($e->getCode() ?: 501, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->get('/api/{model}', function (Request $request, $model) use ($connection) {
    try {
        login($request);
        $resource = model($model, $connection, $request);
    } catch (AuthorizationException $e) {
        return new Response(401, base_headers, json_encode(['error' => $e->getMessage()]));
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $options = $request->get(null, []);
        $include = $request->get('include', '');
        $include = $include ? explode(',', $include) : [];
        $options['include'] = $include;
        $filter = $request->get('filter', []);
        $options['filter'] = $filter;
        $options['distinct'] = intval($request->get('distinct', 0));
        $fields = $request->get('fields', []);
        if (!is_array($fields)) {
            $fields = [$fields];
        }
        $options['fields'] = [];
        foreach ($fields as $name => $field) {
            if ($name === 0) {
                $name = $model;
            }
            $options['fields'][$name] = explode(',', $field);
        }
        $sort = $request->get('sort', '');
        $sort = $sort ? explode(',', $sort) : [];
        $options['sort'] = $sort;
        $options['per_page'] = intval($request->get('per_page', '10'));
        $options['page'] = intval($request->get('page', '1'));
        return new Response(200, base_headers, json_encode($resource->index($options)));
    } catch (Exception $e) {
        error_log(get_class($e));
        error_log($e->getMessage());
        error_log($e->getCode());
        error_log($e->getTraceAsString());
        return new Response($e->getCode() ?: 501, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->post('/api/{model}', function (Request $request, $model) use ($connection) {
    try {
        $resource = model($model, $connection, $request);
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $data = $request->post();
        return new Response(200, base_headers, json_encode($resource->store($data)));
    } catch (Exception $e) {
        error_log($e->getMessage());
        error_log($e->getTraceAsString());
        if ($e->getCode()) {
            return new Response($e->getCode(), base_headers, json_encode(['error' => $e->getMessage()]));
        }
        return new Response(500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->put('/api/{model}/{id}', function (Request $request, $model, $id) use ($connection) {
    try {
        $resource = model($model, $connection, $request);
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $data = $request->post();
        return new Response(200, base_headers, json_encode($resource->update($id, $data)));
    } catch (Exception $e) {
        error_log($e->getTraceAsString());
        return new Response(500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->options('/dev/{model}', function () {
    return new Response(201, base_headers, '');
});
$api->options('/dev/{model}/{id}', function () {
    return new Response(201, base_headers, '');
});

$api->get('/dev/resource', function (Request $request) use ($connection) {
    try {
        $resource = new DevTools($connection, [], $request);
        return new Response(200, base_headers, json_encode($resource->index([])));
    } catch (Exception $e) {
        return new Response($e->getCode() ?: 500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->get('/dev/resource/{id}', function (Request $request, $id) use ($connection) {
    try {
        $resource = new DevTools($connection, [], $request);
        return new Response(200, base_headers, json_encode($resource->show($id)));
    } catch (Exception $e) {
        return new Response($e->getCode() ?: 500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->post('/dev/resource', function (Request $request) use ($connection) {
    try {
        $data = $request->post();
        $resource = new DevTools($connection, [], $request);
        return new Response(200, base_headers, json_encode($resource->store($data)));
    } catch (Exception $e) {
        return new Response($e->getCode() ?: 500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->start();
$workers = \Workerman\Worker::getAllWorkers();
foreach($workers as $worker) {
    $worker->onWorkerStart = function($worker)
    {
        echo "Worker starting...\n";
    };
}
