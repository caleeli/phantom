<?php

namespace App\Resources;

use Exception;
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
        $params = $data['data']['attributes'];
        foreach ($this->definition['create'] as $name => $value) {
            $columns[] = $name;
            $values[] = $this->parseExpressionsInQuery($value, $params);
        }
        $columns = implode(',', $columns);
        $values = implode(',', $values);
        $sql = "INSERT INTO `{$this->definition['table']}` ({$columns}) VALUES ({$values})";
        $this->query($sql, $params);
        return [
            'success' => true,
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
        // params
        $params = $options['params'] ?? [];
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
            $order = '';
            $limit = '';
            $offset = '';
        } else {
            $where = [
                '1=1',
            ];
            foreach ($this->definition['where'] as $whereClause) {
                $where[] = $this->parseExpressionsInQuery($whereClause, $params);
            }
            if (isset($options['filter'])) {
                foreach ($options['filter'] as $filter) {
                    $where[] = $this->parseFilter($filter, $params);
                }
            }
            $where = implode(' ', $where);
            if (isset($options['sort']) && $options['sort']) {
                $order = 'ORDER BY ' . $this->parseSort($options['sort']);
            } else {
                $order = '';
            }
            if (isset($options['per_page'])) {
                $limit = 'LIMIT ' . $options['per_page'];
            } else {
                $limit = '';
            }
            if (isset($options['page'])) {
                $offset = 'OFFSET ' . ($options['page'] - 1) * $options['per_page'];
            } else {
                $offset = '';
            }
        }
        // Prepare the statement
        $query = "SELECT $select FROM $from WHERE $where $order $limit $offset";
        $statement = $this->query($query, $params);
        return $statement;
    }

    private function parseFilter(string $filter, array &$params)
    {
        list($filterName, $filterParamValues) = $this->explodeFilter($filter);
        foreach ($this->definition['filters'] as $defName => $expression) {
            list($name, $paramNames) = $this->explodeFilter($defName);
            if ($name === $filterName) {
                $paramValues = json_decode('[' . $filterParamValues . ']');
                if (!is_array($paramValues)) {
                    throw new Exception('Invalid filter parameters: ' . $filterParamValues);
                }
                $paramNames = explode(',', $paramNames);
                // prefix with filterName
                foreach ($paramNames as $i => $paramName) {
                    $paramNames[$i] = $filterName . '_' . $paramName;
                    $escapedVar = preg_quote($paramName, '/');
                    $expression = preg_replace('/\$' . $escapedVar . '\b/', '$' . $paramNames[$i], $expression);
                    $expression = preg_replace('/\:' . $escapedVar . '\b/', ':' . $paramNames[$i], $expression);
                }
                $filterParam = array_combine($paramNames, $paramValues);
                $params = array_merge($params, $filterParam);
                return $this->parseExpressionsInQuery($expression, $params);
            }
        }
        throw new Exception('Filter not found: ' . $filter);
    }

    /**
     * Parse JSON Api sort expressions into SQL
     * 
     * sort=+field_1,-field_2
     * @param array $sort
     * @return string
     */
    private function parseSort(array $sort)
    {
        $sql = '';
        foreach ($sort as $sortItem) {
            // Parse (+/-)?field
            preg_match('/^([+-]?)(.*)$/', $sortItem, $matches);
            $direction = $matches[1] === '-' ? 'DESC' : 'ASC';
            $field = $matches[2];
            $sql .= $field . ' ' . $direction;
        }
        return $sql;
    }

    private function explodeFilter(string $filter)
    {
        $hasParams = substr($filter, -1) === ')';
        $firstParenthesis = strpos($filter, '(');
        if ($hasParams && !$firstParenthesis) {
            throw new Exception('Invalid filter: ' . $filter);
        }
        $filterName = $hasParams ? substr($filter, 0, $firstParenthesis) : $filter;
        $filterParams = '';
        if ($hasParams) {
            $filterParams = substr($filter, $firstParenthesis + 1, -1);
        }
        return [$filterName, $filterParams];
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
