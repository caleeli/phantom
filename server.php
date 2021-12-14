<?php
require 'vendor/autoload.php';

use App\Resources\JsonApiResource;
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


$api->options('/api/{model}/{id}', function (Request $request) {
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
    return new Response(200, base_headers, json_encode([
        'data' => [
            'type' => 'User',
            'id' => $id,
            'attributes' => [
                'name' => 'Juan Perez',
                'username' => 'juan',
                'avatar' => 'images/avatar/avatar-1.jpg',
                'email' => 'juan@example.com',
                'phone' => '555-555-5555',
                'role_name' => 'admin',
            ],
            'relationships' => [
                'permissions' => [
                    'data' => [
                        [
                            'id' => 1,
                            'type' => "permission",
                            'attributes' => [
                                'name' => "Ingresar al sistema",
                                'enabled' => true,
                            ],
                        ],
                        [
                            'id' => 2,
                            'type' => "permission",
                            'attributes' => [
                                'name' => "Administrar usuarios",
                                'enabled' => false,
                            ],
                        ],
                        [
                            'id' => 3,
                            'type' => "permission",
                            'attributes' => [
                                'name' => "Administrar Roles",
                                'enabled' => false,
                            ],
                        ],
                        [
                            'id' => 4,
                            'type' => "permission",
                            'attributes' => [
                                'name' => "Administrar parámetros",
                                'enabled' => true,
                            ],
                        ],
                        [
                            'id' => 5,
                            'type' => "permission",
                            'attributes' => [
                                'name' => "Monitorizar usuarios dependientes",
                                'enabled' => true,
                            ],
                        ],
                        [
                            'id' => 6,
                            'type' => "permission",
                            'attributes' => [
                                'name' => "Backups de datos",
                                'enabled' => false,
                            ],
                        ],
                        [
                            'id' => 7,
                            'type' => "permission",
                            'attributes' => [
                                'name' => "Búsquedas avanzadas",
                                'enabled' => true,
                            ],
                        ],
                    ],
                ],
            ],
        ]
    ]));
});

$api->get('/api/{model}', function (Request $request, $model) use ($connection) {
    if (!preg_match('/\w+/', $model)) {
        return new Response(404, base_headers, 'Not Found');
    }
    $filename = __DIR__ . '/models/' . $model . '.json';
    if (!file_exists($filename)) {
        return new Response(404, base_headers, 'Not Found');
    }
    $definition = json_decode(file_get_contents($filename), true);
    $resource = new JsonApiResource($connection, $definition);
    return new Response(200, base_headers, json_encode($resource->index()));
});

$api->start();
