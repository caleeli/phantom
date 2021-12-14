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
    }

    public function update($id, array $data)
    {
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
        $params = $options['params'];
        var_dump($options['params']);
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
