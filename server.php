<?php
require 'vendor/autoload.php';

use Mark\App;
use Workerman\Protocols\Http\Request;
use Workerman\Protocols\Http\Response;

$api = new App('http://0.0.0.0:5050');

const base_headers = [
    'Content-Type' => 'application/json',
    'Access-Control-Allow-Origin'      => '*',// 'http://localhost:5000/',
    'Access-Control-Allow-Credentials' => 'true',
    'Access-Control-Allow-Methods'     => 'GET,POST,PUT,DELETE',
    'Access-Control-Allow-Headers' => 'Content-Type,Authorization,X-Requested-With',
    'Server' => 'Phantom',
];


$api->options('/api/{users}/{id}', function (Request $request) {
    return new Response(201, base_headers, '');
});
$api->get('/api/users/{id}', function (Request $request, $id) {
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

$api->start();
