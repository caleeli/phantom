<?php

namespace App\Expressions;

interface ExpressionInterface
{
    public function evaluate(array $variables = []);
}
