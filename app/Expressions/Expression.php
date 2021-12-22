<?php

namespace App\Expressions;

use Exception;
use Throwable;

final class Expression implements ExpressionInterface
{
    private $expression;

    public function __construct(string $expression)
    {
        $this->expression = $expression;
    }

    public function evaluate(array $variables = [])
    {
        set_error_handler(function ($errno, $errstr) {
            throw new Exception($errstr, $errno);
        });
        try {
            extract($variables);
            return eval('return ' . $this->expression . ';');
        } catch (Throwable $err) {
            throw new Exception($err->getMessage() .' in ' . $this->expression);
        }
        restore_error_handler();
    }
}
