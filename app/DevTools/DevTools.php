<?php

namespace App\DevTools;

use App\Resources\EndpointResourceInterface;
use App\Resources\ResourceBase;

class DevTools extends ResourceBase implements EndpointResourceInterface
{
    /**
     * Get the list of resources
     */
    public function index(array $options = [])
    {
        $list = [];
        foreach (glob('.phantom_dev/*.json') as $file) {
            $list[] = [
                'id' => basename($file, '.json'),
                'attributes' => json_decode(file_get_contents($file), true),
            ];
        }
        return [
            'data' => $list
        ];
    }

    public function show($id)
    {
        $file = '.phantom_dev/' . $id . '.json';
        return [
            'data' => [
                'id' => $id,
                'attributes' => json_decode(file_get_contents($file), true),
            ]
        ];
    }

    public function store(array $data)
    {
        $config = $data['data']['attributes'];
        // create migration
        $this->createResource($config);
        run_migrations($config['name']);
    }

    /**
     * Create a new resource
     */
    private function createResource($config)
    {
        // save config
        $filename = '.phantom_dev/' . $config['name'] . '.json';
        file_put_contents($filename, json_encode($config, JSON_PRETTY_PRINT));
        // create migration
        $id = $config['id'];
        $fields = [];
        $fieldNames = [];
        $fieldBinds = [];
        foreach ($config['fields'] as $field) {
            $fields[] = $field['name'] . ' ' . $field['typeDB'];
            $fieldNames[] = $field['name'];
            $fieldBinds[] = ':' . $field['name'];
        }
        $fields = implode(', ', $fields);
        $fieldNamesSql = implode(', ', $fieldNames);
        $fieldBindsSql = implode(', ', $fieldBinds);
        $table = $config['table'] ?? '';
        if ($table) {
            $migration = <<<EOF
            <?php
            \n\$connection->exec('DROP TABLE IF EXISTS {$table}');\n
            \n\$connection->exec('CREATE TABLE {$table} ({$id} INTEGER PRIMARY KEY, {$fields})');\n
            EOF;
            $data = $config['data'];
            foreach ($data as $row) {
                $params = \var_export($row, true);
                $migration .= <<<EOF
                \$statement = \$connection->prepare('INSERT INTO {$table} ({$fieldNamesSql}) VALUES ({$fieldBindsSql})');
                \$statement->execute({$params});\n
                EOF;
            }
            $migrationFilename = 'migrations/' . $table . '.php';
            file_put_contents($migrationFilename, $migration);
        }
        // create model
        $attributes = [];
        foreach ($config['fields'] as $field) {
            if ($field['select']) {
                $attributes[$field['name']] = $field['select'];
            }
        }
        $where = $config['where'] ? explode("\n", $config['where']) : [];
        $filters = [];
        foreach ($config['filters'] as $filter) {
            $filters[$filter['declaration']] = $filter['expression'];
        }
        $sort = $config['sort'] ? explode(",", $config['sort']) : [];
        $create = [];
        foreach ($config['fields'] as $field) {
            if ($field['create']) {
                $create[$field['name']] = $field['create'];
            }
        }
        $update = [];
        foreach ($config['fields'] as $field) {
            if ($field['update']) {
                $update[$field['name']] = $field['update'];
            }
        }
        $delete = [];
        $relationships = [];
        foreach ($config['relationships'] as $relationship) {
            $params = [];
            foreach ($relationship['params'] as $param) {
                $params[$param['name']] = $param['value'];
            }
            $relationships[$relationship['name']] = [
                'model' => $relationship['model'],
                'params' => $params,
            ];
        }
        $plural = ucwords(str_replace('_', ' ', $config['name']), " \t\r\n\f\v");
        $labels = [
            '_model' => $this->textToSingular($plural),
            '_models' => $plural,
        ];
        $ui = [];
        foreach ($config['fields'] as $field) {
            if ($field['label']) {
                $labels[$field['name']] = $field['label'];
            }
            if ($field['type']) {
                $ui[$field['name']] = [
                    'type' => $field['type'],
                    'showInList' => $field['showInList'],
                    'showInCreate' => $field['showInCreate'],
                    'showInUpdate' => $field['showInUpdate'],
                    'groupRows' => $field['groupRows'] ?? false,
                ];
                if (!empty($field['extra'])) {
                    $extra = json_decode($field['extra'], true);
                    $ui[$field['name']] = array_merge($ui[$field['name']], $extra);
                }
                if (!$ui[$field['name']]['groupRows']) {
                    unset($ui[$field['name']]['groupRows']);
                }
                if ($ui[$field['name']]['showInCreate']) {
                    unset($ui[$field['name']]['showInCreate']);
                }
                if ($ui[$field['name']]['showInUpdate']) {
                    unset($ui[$field['name']]['showInUpdate']);
                }
            }
        }
        $ui['_actions'] = [
            'control' => 'actions',
            'value' => 'attributes.id',
            'actions' => explode(',', $config['actions']),
        ];
        $createButtons = $config['createButtons'] ?? [];
        foreach($createButtons as $i => $button) {
            $button_attributes = [];
            foreach ($button['attributes'] as $key => $value) {
                if ($value) {
                    $button_attributes[$key] = json_decode($value);
                }
            }
            $button['attributes'] = $button_attributes;
            $createButtons[$i] = $button;
        }
        $model = [
            'class' => 'JsonApi',
            'url' => $config['url'],
            'table' => $table,
            'join' => $config['join'] ?? null,
            'id' => $id,
            'attributes' => $attributes,
            'where' => $where,
            'filters' => (object) $filters,
            'sort' => $sort,
            'create' => (object) $create,
            'update' => (object) $update,
            'delete' => (object) $delete,
            'relationships' => (object) $relationships,
            'labels' => $labels,
            'ui' => $ui,
            'createButtons' => $createButtons,
        ];
        if (empty($model['join'])) {
            unset($model['join']);
        }
        if (empty($model['createButtons'])) {
            unset($model['createButtons']);
        }
        $modelFilename = 'models/' . $config['name'] . '.json';
        file_put_contents($modelFilename, \str_replace('    ', "\t", json_encode($model, JSON_PRETTY_PRINT)));
    }

    private function textToSingular($text)
    {
        if ($_ENV['language'] === 'en') {
            $text = preg_replace('/ies$/', 'y', $text);
        }
        $text = preg_replace('/s$/', '', $text);
        return $text;
    }
}
