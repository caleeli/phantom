<?php

namespace App\Expressions;

use Exception;
use Throwable;
use Workerman\Protocols\Http\Request;

final class Expression implements ExpressionInterface
{
    private $expression;
    private $request;

    public function __construct(string $expression, Request $request)
    {
        $this->expression = $expression;
        $this->request = $request;
    }

    public function evaluate(array $variables = [])
    {
        set_error_handler(function ($errno, $errstr) {
            throw new Exception($errstr, $errno);
        });
        try {
            extract($variables);
            $_request = $this->request;
            return eval('return ' . $this->expression . ';');
        } catch (Throwable $err) {
            throw new Exception($err->getMessage() .' in ' . $this->expression, $err->getCode(), $err);
        }
        restore_error_handler();
    }
}
