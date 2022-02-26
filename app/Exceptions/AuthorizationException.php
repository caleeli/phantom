<?php

namespace App\Exceptions;

use Exception;

class AuthorizationException extends Exception
{
    public function __construct(Exception $previous = null)
    {
        parent::__construct('You are not authorized to perform this action', 401, $previous);
        \var_dump($this->getCode());
    }
}
