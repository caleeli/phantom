<?php
require 'vendor/autoload.php';

$env = parse_ini_file('.env');

// First arg: name of the migration
$name = $argv[1] ?? '';

$connection = new PDO($env['dns'], $env['user'], $env['password']);

if (file_exists('migrations.json')) {
    $skip = json_decode(file_get_contents('migrations.json'), true);
} else {
    $skip = [];
}

run_migrations($name, $skip);
file_put_contents('migrations.json', json_encode($skip));
