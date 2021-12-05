<?php

namespace App\Resources;

use PDO;

abstract class ResourceBase
{
    /**
     * @var PDO
     */
    protected $connection;

    /**
     * @var array
     */
    protected $definition;

    public function __construct(PDO $connection, array $definition)
    {
        $this->connection = $connection;
        $this->definition = $definition;
    }
}
