<?php

namespace App\Resources;

interface EndpointResourceInterface
{
    /**
     * Run the endpoint from index
     */
    public function index(array $options = []);
}
