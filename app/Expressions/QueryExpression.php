<?php

namespace App\Expressions;

use Exception;
use Workerman\Protocols\Http\Request;

final class QueryExpression implements QueryExpressionInterface
{
    private $expression;
    /**
     * @var Expression[]
     **/
    private $expressions = [];

    public function __construct(string $expression, Request $request)
    {
        $expressions = [];
        $tag = self::OPEN_TAG;
        $tagLength = strlen($tag);
        $tagEnd = self::CLOSE_TAG;
        $tagEndLength = strlen($tagEnd);
        $tagPos = strpos($expression, $tag);
        while ($tagPos !== false) {
            $tagEndPos = strpos($expression, $tagEnd, $tagPos + $tagLength);
            if ($tagEndPos === false) {
                throw new Exception('Tag not closed: ' . $expression);
            }
            $tagContent = substr($expression, $tagPos + $tagLength, $tagEndPos - $tagPos - $tagLength);
            $newVariable = uniqid('var_');
            $expressions[$newVariable] = new Expression($tagContent, $request);
            $expression = substr_replace($expression, ':' . $newVariable, $tagPos, $tagEndPos + $tagEndLength - $tagPos);
            $tagPos = strpos($expression, $tag);
        }
        $this->expressions = $expressions;
        $this->expression = $expression;
    }

    public function evaluate(array $variables = [])
    {
        $newVariables = [];
        foreach ($this->expressions as $name => $expression) {
            $newVariables[$name] = $expression->evaluate($variables);
        }
        return $newVariables;
    }

    public function preparedExpression():string
    {
        return $this->expression;
    }

    public function hasRequiredParams(array $params):bool
    {
        foreach ($this->expressions as $name => $expression) {
            if (!$expression->hasRequiredParams($params)) {
                return false;
            }
        }
        return true;
    }
}
