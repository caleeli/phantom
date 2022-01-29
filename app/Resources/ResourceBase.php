<?php

namespace App\Resources;

use App\Expressions\Expression;
use App\Expressions\QueryExpression;
use PDO;
use PDOStatement;

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

    /**
     * Execute a query, and return the statement
     * 
     * Also removes the unused parameters from the $params array
     *
     * @param string $query
     * @param array $options
     *
     * @return PDOStatement
     */
    protected function query($query, array $params = [])
    {
        // Find :variable in $query
        $matches = [];
        preg_match_all('/:([a-zA-Z0-9_]+)/', $query, $matches);
        $variables = $matches[1];
        // Filter params by $variables
        $params = array_filter($params, function ($key) use ($variables) {
            return in_array($key, $variables);
        }, ARRAY_FILTER_USE_KEY);
        error_log($query);
        error_log(print_r($params, true));
        $statement = $this->connection->prepare($query);
        $result = $statement->execute($params);
        return $statement;
    }

    protected function evaluate($expression, array $variables = [])
    {
        $expression = new Expression($expression);
        return $expression->evaluate($variables);
    }

    /**
     * Parse and replace the ${expressions} in the query
     *
     * @param string $query ex. where cost = ${cost*100}
     * @param array $params ex. ['cost' => 100]
     *
     * @return string ex. where cost = :var_1234 and the value of $params['var_1234'] is 10000
     */
    protected function parseExpressionsInQuery($string, array &$params)
    {
        $expression = new QueryExpression($string);
        $newVariables = $expression->evaluate($params);
        $params = array_merge($params, $newVariables);
        return $expression->preparedExpression();
    }
}
