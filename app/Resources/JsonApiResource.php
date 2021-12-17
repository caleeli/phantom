<?php

namespace App\Resources;

use PDO;

class JsonApiResource extends ResourceBase implements JsonApiResourceInterface
{
    public function index(array $options = [])
    {
        $statement = $this->prepareQuery($options);
        $rows = $statement->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $i => $row) {
            $rows[$i] = $this->formatRow($row, $options);
        }
        return [
            'data' => $rows,
        ];
    }

    public function show($id, array $options = [])
    {
        $options['params']['id'] = $id;
        $statement = $this->prepareQuery($options, true);
        $row = $statement->fetch(PDO::FETCH_ASSOC);
        return [
            'data' => $this->formatRow($row, $options),
        ];
    }

    public function store(array $data)
    {
        $columns = [];
        $values = [];
        foreach ($this->definition['create'] as $name => $value) {
            $columns[] = $name;
            $values[] = $value;
        }
        $columns = implode(',', $columns);
        $values = implode(',', $values);
        $sql = "INSERT INTO `{$this->definition['table']}` ({$columns}) VALUES ({$values})";
        $statement = $this->connection->prepare($sql);
        error_log($sql);
        var_dump($data['data']['attributes']);
        $success = $statement->execute($data['data']['attributes']);
        return [
            'success' => $success,
        ];
    }

    public function update($id, array $data)
    {
        $set = [];
        foreach ($this->definition['update'] as $name => $value) {
            $set[] = "$name = $value";
        }
        $set = implode(',', $set);
        $sql = "UPDATE `{$this->definition['table']}` SET {$set} WHERE {$this->definition['id']} = :id";
        error_log($sql);
        var_dump($data['data']['attributes']);
        $statement = $this->connection->prepare($sql);
        $success = $statement->execute($data['data']['attributes']);
        return [
            'success' => $success,
        ];
    }

    public function destroy($id)
    {
    }

    private function prepareQuery(array $options, $byId = false)
    {
        // Prepare the $from of the query
        $from = $this->definition['table'];
        if (isset($this->definition['join'])) {
            $from .= ' ' . $this->definition['join'];
        }
        // Prepare the $select of the query
        $select = [
            $this->definition['id'] === 'id' ? 'id' : $this->definition['id'] . ' as id',
        ];
        foreach ($this->definition['attributes'] as $name => $column) {
            $select[] = $column === $name ? $name : $column . ' AS ' . $name;
        }
        $select = implode(',', $select);
        // Prepare the $where of the query
        if ($byId) {
            $where = $this->definition['id'] . ' = :id';
        } else {
            $where = [
                '1=1',
            ];
            array_push($where, ...$this->definition['where']);
            $where = implode(' ', $where);
        }
        // Prepare the statement
        error_log("SELECT $select FROM $from");
        $statement = $this->connection->prepare("SELECT $select FROM $from WHERE $where");
        $params = $options['params'] ?? [];
        var_dump($params);
        $statement->execute($params);
        return $statement;
    }

    private function formatRow(array $row, array $options)
    {
        $result = [
            'id' => $row['id'],
            'type' => $this->definition['table'],
            'attributes' => $row,
            'relationships' => [],
        ];
        if (isset($options['include'])) {
            foreach ($options['include'] as $include) {
                $result['relationships'][$include] = $this->include($row, $include);
            }
        }
        return $result;
    }

    private function include(array $row, $include)
    {
        $relationship = $this->definition['relationships'][$include];
        if (isset($relationship['params'])) {
            // replace $column by $row[column] value
            foreach ($relationship['params'] as $column => $value) {
                if (substr($value, 0, 1) === '$') {
                    $relationship['params'][$column] = $row[substr($value, 1)];
                }
            }
        }
        $model = model($relationship['model'], $this->connection);
        return $model->index($relationship);
    }
}
