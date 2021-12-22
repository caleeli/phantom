<?php
require 'vendor/autoload.php';

use Mark\App;
use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;

$env = parse_ini_file('.env');

$api = new App($env['api_base']);

const base_headers = [
    'Content-Type' => 'application/json',
    'Access-Control-Allow-Origin'      => '*',
    'Access-Control-Allow-Credentials' => 'true',
    'Access-Control-Allow-Methods'     => 'GET,POST,PUT,DELETE',
    'Access-Control-Allow-Headers' => 'Content-Type,Authorization,X-Requested-With',
    'Server' => 'Phantom',
];

$connection = new PDO('sqlite::memory:');
$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$connection->exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, username TEXT, email TEXT, phone TEXT, password TEXT, status TEXT)');
$connection->exec('CREATE TABLE roles (id INTEGER PRIMARY KEY, name TEXT)');
$connection->exec('CREATE TABLE user_roles (id INTEGER PRIMARY KEY, user_id INTEGER, role_id INTEGER)');
$connection->exec('CREATE TABLE permissions (id INTEGER PRIMARY KEY, name TEXT)');
$connection->exec('CREATE TABLE role_permissions (id INTEGER PRIMARY KEY, role_id INTEGER, permission_id INTEGER)');
$connection->exec('CREATE TABLE tasks (task_id INTEGER PRIMARY KEY, title TEXT, body TEXT, task_usr_id INTEGER, status TEXT, created_at DATETIME, updated_at DATETIME)');

$connection->exec('CREATE TABLE transacciones (id INTEGER PRIMARY KEY, fecha DATETIME, nombre TEXT, cuenta TEXT, ingreso NUMERIC, egreso NUMERIC)');
// insert sample users
$connection->exec('INSERT INTO users (id, name, username, email, phone, password, status) VALUES (1, "Juan Perez", "juan", "juan@example.com", "555-555-55", "5f4dcc3b5aa765d61d8327deb882cf99", "ACTIVE")');
$connection->exec('INSERT INTO users (id, name, username, email, phone, password, status) VALUES (2, "Maria Gonzales", "maria", "maria@example.com", "555-555-55", "5f4dcc3b5aa765d61d8327deb882cf99", "ACTIVE")');
$connection->exec('INSERT INTO users (id, name, username, email, phone, password, status) VALUES (3, "Cesar Ferine", "cesar", "cesar@example.com", "555-555-55", "5f4dcc3b5aa765d61d8327deb882cf99", "INACTIVE")');
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
$connection->exec('INSERT INTO permissions (id, name) VALUES (1, "Ingresar al sistema	")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (2, "Administrar usuarios	")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (3, "Administrar Roles	")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (4, "Administrar parámetros	")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (5, "Monitorizar usuarios dependientes	")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (6, "Backups de datos	")');
$connection->exec('INSERT INTO permissions (id, name) VALUES (7, "Búsquedas avanzadas")');
// insert role permissions
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 2)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 3)');
$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 4)');
//$connection->exec('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 5)');
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
for ($i=0;$i<10;$i++) {
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
        $resource = model($model, $connection);
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
        $resource = model($model, $connection);
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
        return new Response(200, base_headers, json_encode($resource->index($options)));
    } catch (Exception $e) {
        return new Response(500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->post('/api/{model}', function (Request $request, $model) use ($connection) {
    try {
        $resource = model($model, $connection);
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $data = $request->post();
        return new Response(200, base_headers, json_encode($resource->store($data)));
    } catch (Exception $e) {
        return new Response(500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->put('/api/{model}/{id}', function (Request $request, $model, $id) use ($connection) {
    try {
        $resource = model($model, $connection);
    } catch (Exception $e) {
        return new Response(404, base_headers, json_encode(['error' => $e->getMessage()]));
    }
    try {
        $data = $request->post();
        return new Response(200, base_headers, json_encode($resource->update($id, $data)));
    } catch (Exception $e) {
        return new Response(500, base_headers, json_encode(['error' => $e->getMessage()]));
    }
});

$api->start();

function mockTabla($connection, $name, $fields, $n, $id = 1)
{
    $columns = [];
    foreach ($fields as $field) {
        $columns[] = $field['name'].' '.$field['type'];
    }
    $columns = implode(', ', $columns);
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
