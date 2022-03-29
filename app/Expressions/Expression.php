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
            throw new Exception($errstr . ':' . $this->expression, $errno);
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

    public function hasRequiredParams(array $params):bool
    {
        // parse php tokens of $this->expression
        $tokens = token_get_all('<?php ' . $this->expression);
        // check if all $varaibles are in $params
        foreach ($tokens as $token) {
            if (is_array($token) && $token[0] === T_VARIABLE) {
                $variable = substr($token[1], 1);
                if (!isset($params[$variable])) {
                    return false;
                }
            }
        }
        return true;
    }
}
