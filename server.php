<?php
require 'vendor/autoload.php';

use App\DevTools\DevTools;
use App\Exceptions\AuthorizationException;
use Mark\App;
use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;

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

$connection->exec('DROP TABLE IF EXISTS sessions');
$connection->exec('DROP TABLE IF EXISTS roles');
$connection->exec('DROP TABLE IF EXISTS user_roles');
$connection->exec('DROP TABLE IF EXISTS permissions');
$connection->exec('DROP TABLE IF EXISTS role_permissions');
$connection->exec('DROP TABLE IF EXISTS tasks');
$connection->exec('DROP TABLE IF EXISTS transacciones');

$connection->exec('CREATE TABLE sessions (token CHAR(128) PRIMARY KEY, user_id INTEGER, username TEXT, created_at DATETIME)');
$connection->exec('CREATE TABLE roles (id INTEGER PRIMARY KEY, name TEXT)');
$connection->exec('CREATE TABLE user_roles (id INTEGER PRIMARY KEY, user_id INTEGER, role_id INTEGER)');
$connection->exec('CREATE TABLE permissions (id INTEGER PRIMARY KEY, name TEXT)');
$connection->exec('CREATE TABLE role_permissions (id INTEGER PRIMARY KEY, role_id INTEGER, permission_id INTEGER)');
$connection->exec('CREATE TABLE tasks (task_id INTEGER PRIMARY KEY, title TEXT, body TEXT, task_usr_id INTEGER, status TEXT, created_at DATETIME, updated_at DATETIME)');
$connection->exec('CREATE TABLE transacciones (id INTEGER PRIMARY KEY, fecha DATETIME, nombre TEXT, cuenta TEXT, ingreso NUMERIC, egreso NUMERIC)');

// insert roles
$connection->exec('INSERT INTO roles (id, name) VALUES (1, "Administrador del sistema")');
$connection->exec('INSERT INTO roles (id, name) VALUES (2, "Director")');
$connection->exec('INSERT INTO roles (id, name) VALUES (3, "Auditor")');
$connection->exec('INSERT INTO roles (id, name) VALUES (4, "Cajero")');
// insert user_roles
$connection->exec('INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)');
$connection->exec('INSERT INTO user_roles (user_id, role_id) VALUES (2, 1)');
$connection->exec('INSERT INTO user_roles (user_id, role_id) VALUES (3, 1)');
$connection->exec('INSERT INTO user_roles (user_id, role_id) VALUES (4, 1)');
// insert permissions
$connection->exec('INSERT INTO permissions (id, name) VALUES (1, "cuadro de mando")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (2, "cajas")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (3, "clientes")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (4, "creditos")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (5, "usuarios")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (6, "perfil")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (7, "plan anual")');
// insert role permissions
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 2)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 3)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 4)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 5)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 6)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 7)');
// insert sample tasks
$connection->exec('INSERT INTO tasks (task_id, title, body, task_usr_id, created_at, updated_at) VALUES (1, "Task 1", "Task 1 body", 1, "2020-01-01 00:00:00", "2020-01-01 00:00:00")');
$connection->exec('INSERT INTO tasks (task_id, title, body, task_usr_id, created_at, updated_at) VALUES (2, "Task 2", "Task 2 body", 1, "2020-01-02 00:00:00", "2020-01-02 00:00:00")');
$connection->exec('INSERT INTO tasks (task_id, title, body, task_usr_id, created_at, updated_at) VALUES (3, "Task 3", "Task 3 body", 2, "2021-01-03 00:00:00", "2021-01-03 00:00:00")');

// insert transacciones
$faker = Faker\Factory::create();
$n=rand(1000000, 10000000);
$date = new DateTime();
for ($i=0;$i<50;$i++) {
    $fecha = $date->format('Y-m-d');
    $nombre = $faker->name;
    $cuenta = $faker->bankAccountNumber;
    if (rand(0, 1)) {
        $ingreso = $faker->randomFloat(2, 1000, 5000);
        $egreso = 0;
    } else {
        $ingreso = 0;
        $egreso = $faker->randomFloat(2, 1000, 5000);
    }
    $connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "'.$fecha.'", "'.$nombre.'", "'.$cuenta.'", '.$ingreso.', '.$egreso.')');
    $date->modify('-'.rand(3600, 36000).' minute');
}
/*$connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "2020-01-02 00:00:00", "Ana Acosta", "1210692772", 200)');
$connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "2020-01-03 00:00:00", "Marta Quenta", "2310692712", 300)');
$connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "2020-01-04 00:00:00", "Juan Perez", "4310692775", 400)');
$connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "2020-01-05 00:00:00", "Ana Acosta", "1110692784", 500)');
$connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "2020-01-06 00:00:00", "Marta Quenta", "1810592936", 600)');
$connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "2020-01-07 00:00:00", "Juan Perez", "1910692122", 700)');
$connection->exec('INSERT INTO transacciones (id, fecha, nombre, cuenta, ingreso, egreso) VALUES ('.($n++).', "2020-01-08 00:00:00", "Ana Acosta", "1310632140", 800)');
*/

run_migrations();

mockTabla($connection, 'creditos', [
    [
        'name' => "nombre",
        'type' => 'TEXT',
        'faker' => 'name',
    ],
    [
        'name' => "fecha",
        'type' => 'DATETIME',
        'faker' => 'datetime()->format("Y-m-d")',
    ],
    [
        'name' => "producto",
        'type' => 'TEXT',
        'faker' => 'randomElement(["Casa", "Automovil", "Hipoteca", "Otro"])',
    ],
    [
        'name' => "monto",
        'type' => 'NUMERIC',
        'faker' => 'randomFloat(2, 10000, 50000)',
    ],
    [
        'name' => "saldo",
        'type' => 'NUMERIC',
        'faker' => 'randomFloat(2, 5000, 10000)',
    ],
    [
        'name' => "fecha_ultimo_movimiento",
        'type' => 'DATETIME',
        'faker' => 'datetime()->format("Y-m-d")',
    ],
], 10, rand(1000, 3000));

// Clientes
// Codigo, nombres, direccion, telefono, fecha de resgistro
mockTabla($connection, 'clientes', [
    [
        'name' => "nombre",
        'type' => 'TEXT',
        'faker' => 'name',
    ],
    [
        'name' => "cuenta",
        'type' => 'TEXT',
        'faker' => 'bankAccountNumber',
    ],
    [
        'name' => "direccion",
        'type' => 'TEXT',
        'faker' => 'address',
    ],
    [
        'name' => "telefono",
        'type' => 'TEXT',
        'faker' => 'phoneNumber',
    ],
    [
        'name' => "fecha",
        'type' => 'DATE',
        'faker' => 'datetime()->format("Y-m-d")',
    ],
], 10, rand(1000, 3000));

$api->options('/api/{model}/{id}', function (Request $request) {
    return new Response(201, base_headers, '');
});
$api->options('/api/{model}', function (Request $request) {
    return new Response(201, base_headers, '');
});

$api->get('/api/{model}/{id}', function (Request $request, $model, $id) use ($connection) {
    try {
        $resource = model($model, $connection, $request);
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $options = [];
        $include = $request->get('include', '');
        $include = $include ? explode(',', $include) : [];
        $options['include'] = $include;
        return new Response(200, base_headers, json_encode($resource->show($id, $options)));
    } catch (Exception $e) {
        return new Response(500, base_headers, json_encode(['error' => $e->getMessage()]));
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
        $options = [];
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

function mockTabla($connection, $name, $fields, $n, $id = 1)
{
    $columns = [];
    foreach ($fields as $field) {
        $columns[] = $field['name'].' '.$field['type'];
    }
    $columns = implode(', ', $columns);
    $connection->exec("DROP TABLE IF EXISTS $name");
    $connection->exec("CREATE TABLE $name (id INTEGER PRIMARY KEY, $columns)");
    $faker = Faker\Factory::create();
    for ($i=0; $i<$n; $i++) {
        $values = [];
        foreach ($fields as $field) {
            $value = eval('return $faker->'.$field['faker'].';');
            $values[] = is_numeric($value) ? $value : json_encode($value);
        }
        $values = implode(', ', $values);
        $connection->exec("INSERT INTO $name VALUES ($id, $values)");
        $id++;
    }
}
