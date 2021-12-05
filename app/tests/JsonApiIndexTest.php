<?php

namespace App\Tests;

use App\Resources\JsonApiResource;
use App\Resources\JsonApiResourceInterface;
use PDO;
use PHPUnit\Framework\TestCase;

final class JsonApiIndexTest extends TestCase
{
    /**
     * @var JsonApiResourceInterface
     */
    private $api;

    /**
     * Initialize the DB connection to sqlite in memory
     */
    protected function setUp(): void
    {
        $this->connection = new PDO('sqlite::memory:');
        $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->connection->exec('CREATE TABLE users (usr_id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT, status TEXT, created_at DATETIME, updated_at DATETIME)');
        $this->connection->exec('CREATE TABLE tasks (task_id INTEGER PRIMARY KEY, title TEXT, body TEXT, task_usr_id INTEGER, status TEXT, created_at DATETIME, updated_at DATETIME)');
        // insert sample users
        $this->connection->exec('INSERT INTO users (usr_id, name, email, password, status, created_at, updated_at) VALUES (1, "Juan", "juan@example.com", "5f4dcc3b5aa765d61d8327deb882cf99", "ACTIVE", "2020-01-01 00:00:00", "2020-01-01 00:00:00")');
        $this->connection->exec('INSERT INTO users (usr_id, name, email, password, status, created_at, updated_at) VALUES (2, "Maria", "maria@example.com", "5f4dcc3b5aa765d61d8327deb882cf99", "ACTIVE", "2021-01-01 00:00:00", "2021-01-01 00:00:00")');
        $this->connection->exec('INSERT INTO users (usr_id, name, email, password, status, created_at, updated_at) VALUES (3, "Cesar", "cesar@example.com", "5f4dcc3b5aa765d61d8327deb882cf99", "INACTIVE", "2020-01-01 00:00:00", "2020-01-01 00:00:00")');
        // insert sample tasks
        $this->connection->exec('INSERT INTO tasks (task_id, title, body, task_usr_id, created_at, updated_at) VALUES (1, "Task 1", "Task 1 body", 1, "2020-01-01 00:00:00", "2020-01-01 00:00:00")');
        $this->connection->exec('INSERT INTO tasks (task_id, title, body, task_usr_id, created_at, updated_at) VALUES (2, "Task 2", "Task 2 body", 1, "2020-01-02 00:00:00", "2020-01-02 00:00:00")');
        $this->connection->exec('INSERT INTO tasks (task_id, title, body, task_usr_id, created_at, updated_at) VALUES (3, "Task 3", "Task 3 body", 2, "2021-01-03 00:00:00", "2021-01-03 00:00:00")');

        // initialize the api
        $this->api = new JsonApiResource($this->connection, [
            "class" => "JsonApi",
            "url" => "/api/v1/users",
            "table" => "users",
            "id" => "usr_id",
            "attributes" => [
                "name" => "name",
                "email" => "email",
                "count" => "(select count(*) from tasks where task_usr_id=usr_id)",
                "min" => "(select min(created_at) from tasks where task_usr_id=usr_id)",
                "max" => "(select max(created_at) from tasks where task_usr_id=usr_id)"
            ],
            "where" => [
                "and status='ACTIVE'"
            ],
            "filters" => [
                "whereCreatedIn(year)" => "and strftime(created_at, '%Y')=:year",
                "whereNameContains(text)" => "and name like {{}}",
            ],
            "create" => [
                "name" => ":name",
                "email" => ":email",
                "password" => "{{md5(password)}}"
            ],
            "update" => [
                "name" => ":name",
                "email" => ":email",
                "password" => "{{md5(password)}}"
            ],
            "delete" => [
                "status" => "'DELETED'"
            ],
        ]);
    }

    /**
     * Cleanup the DB connection
     */
    protected function tearDown(): void
    {
        $this->connection = null;
    }

    /**
     * Test the index action
     */
    public function testIndex()
    {
        $array = $this->api->index();
        $this->assertEquals([
            "data" => [
                [
                    "id" => 1,
                    "type" => "users",
                    "attributes" => [
                        "name" => "Juan",
                        "email" => "juan@example.com",
                        "count" => 2,
                        "min" => "2020-01-01 00:00:00",
                        "max" => "2020-01-02 00:00:00",
                    ]
                ],
                [
                    "id" => 2,
                    "type" => "users",
                    "attributes" => [
                        "name" => "Maria",
                        "email" => "maria@example.com",
                        "count" => 1,
                        "min" => "2021-01-03 00:00:00",
                        "max" => "2021-01-03 00:00:00",
                    ]
                ],
            ]

        ], $array);
    }

    /**
     * Test the index filters
     */
    public function testFilters()
    {
        // Filter by users created in 2020
        $array = $this->api->index([
            'filters' => [
                'whereCreatedIn(2020)'
            ]
        ]);
        $this->assertEquals([
            "data" => [
                [
                    "id" => 1,
                    "type" => "users",
                    "attributes" => [
                        "name" => "Juan",
                        "email" => "juan@example.com",
                        "count" => 2,
                        "min" => "2020-01-01 00:00:00",
                        "max" => "2020-01-02 00:00:00",
                    ]
                ],
            ]

        ], $array);
    }
}
