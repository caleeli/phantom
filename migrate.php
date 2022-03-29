<?php
require 'vendor/autoload.php';

$env = parse_ini_file('.env');

// First arg: name of the migration
$name = $argv[1] ?? '';

$connection = new PDO($env['dns'], $env['user'], $env['password']);

run_migrations($name);
