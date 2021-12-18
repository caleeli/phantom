<?php

namespace App\Expressions;

interface QueryExpressionInterface
{
    public const WITH_TAGS = true;
    public const WITHOUT_TAGS = false;
    public const OPEN_TAG = '${';
    public const CLOSE_TAG = '}';
    public const TYPE_QUERY = 'query';
    public const TYPE_EXPRESSION = 'expression';

    public function evaluate(array $variables = []);

    public function preparedExpression(): string;
}
