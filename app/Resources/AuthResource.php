<?php

namespace App\Resources;

use Exception;

class AuthResource extends ResourceBase implements JsonApiResourceInterface
{
    public function index(array $options = [])
    {
        return [
            'data' => [],
        ];
    }

    public function show($id, array $options = [])
    {
        return [
            'data' => [],
        ];
    }

    public function store(array $data)
    {
        $login = $data['data']['attributes'];
        $model = $this->model('users');
        $username = $login['username'];
        $password = $login['password'];
        $params = json_encode($username) . ',' . json_encode($password);
        $select = $model->index(['filter' => ['login(' . $params . ')']]);
        if (count($select['data']) === 1) {
            $user = $select['data'][0];
            $session = $this->generateSession($user);
            return [
                'data' => [
                    'username' => $login['username'],
                    'attributes' => $user['attributes'],
                    'signInUserSession' => $session['attributes'],
                ],
            ];
        }
        throw new Exception('Invalid username or password', 401);
    }

    public function update($id, array $data)
    {
        return [
        ];
    }

    public function destroy($id)
    {
    }

    private function generateSession($user)
    {
        $bytes = openssl_random_pseudo_bytes(64);
        $token   = bin2hex($bytes);
        $model = $this->model('sessions');
        $session = [
            'data' => [
                'attributes' => [
                    'user_id' => $user['id'],
                    'username' => $user['attributes']['username'],
                    'token' => $token,
                    'created_at' => date('Y-m-d H:i:s'),
                ],
            ],
        ];
        $model->store($session);
        return $session['data'];
    }
}
