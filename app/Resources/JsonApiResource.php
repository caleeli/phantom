<?php

namespace App\Resources;

class JsonApiResource extends ResourceBase implements JsonApiResourceInterface
{
    public function index(array $options = [])
    {
        $statement = $this->connection->prepare('SELECT * FROM ' . $this->definition['table']);
        $params = [];
        $statement->execute($params);
        return [
            'data' => $statement->fetchAll()
        ];
    }

    public function show($id)
    {
    }

    public function store(array $data)
    {
    }

    public function update($id, array $data)
    {
    }

    public function destroy($id)
    {
    }
}
