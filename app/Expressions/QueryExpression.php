<?php

namespace App\Expressions;

use Exception;

final class QueryExpression implements QueryExpressionInterface
{
    private $expression;
    /**
     * @var Expression[]
     **/
    private $expressions = [];

    public function __construct(string $expression)
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
                throw new Exception('Tag not closed');
            }
            $tagContent = substr($expression, $tagPos + $tagLength, $tagEndPos - $tagPos - $tagLength);
            $newVariable = uniqid('var_');
            $expressions[$newVariable] = new Expression($tagContent);
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
}
