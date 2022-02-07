<?php

namespace App\Resources;

use PDO;

class EndpointResource extends ResourceBase implements EndpointResourceInterface
{
    /**
     * Run the endpoint
     */
    public function index(array $options = [])
    {
        foreach ($this->definition['queries'] as $assignment => $query) {
            $statement = $this->prepareQuery($options, $query);
            $oneRow = substr($assignment, 0, 1) === '{';
            if ($oneRow) {
                $row = $statement->fetch(PDO::FETCH_ASSOC);
                foreach (explode(',', $assignment) as $key) {
                    $key = trim($key, '{ }');
                    $options['params'][$key] = $row[$key];
                }
            } else {
                $rows = $statement->fetchAll(PDO::FETCH_ASSOC);
                $options['params'][$assignment] = $rows;
            }
        }
        return $this->prepareReturn($this->definition['return'], $options['params']);
    }

    private function prepareQuery(array $options, $query)
    {
        if (is_array($query)) {
            $sql = implode("\n", $query);
        } else {
            $sql = $query;
        }
        $params = $options['params'] ?? [];
        $sql = $this->parseExpressionsInQuery($sql, $params);
        $statement = $this->query($sql, $params);
        return $statement;
    }

    private function prepareReturn($return, array $variables)
    {
        if (is_array($return)) {
            $response = [];
            foreach ($return as $key => $value) {
                $response[$key] = $this->prepareReturn($value, $variables);
            }
        } else {
            // $response = $this->dotNotation($variables, $return);
            $response = $this->evaluate($return, $variables);
        }
        return $response;
    }

    private function dotNotation($array, $key)
    {
        $keys = explode('.', $key);
        $value = $array;
        foreach ($keys as $key) {
            $value = $value[$key];
        }
        return $value;
    }
}
