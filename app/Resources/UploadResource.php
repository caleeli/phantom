<?php

namespace App\Resources;

class UploadResource extends ResourceBase implements JsonApiResourceInterface
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
        $file = $this->request->file('file');
        $published = $this->publishFile($file);
        return [
            'data' => [
                'attributes' => $published,
            ],
        ];
    }

    public function update($id, array $data)
    {
        return [];
    }

    public function destroy($id)
    {
    }

    private function publishFile(array $file)
    {
        global $env;
        $filename = $file['name'];
        $code = md5($filename . time());
        $filename = $code . '/' . $filename;
        mkdir('public/uploads/' . $code);
        $path = 'uploads/' . $filename;
        copy($file['tmp_name'], 'public/' . $path);
        return [
            'filename' => $file['name'],
            'url' => $env['cdn_base'] . $path,
        ];
    }
}
