<?php

global $connection;

$model = model('informes', $connection, $this->request);
$model2 = model('movimientos', $connection, $this->request);
$report = $model->show($id);
$informe = $report['data']['attributes'];
$detail = $model2->index(['params'=>['informe_id' => $id]]);
$movimientos = $detail['data'];
$definition2 = $model2->getDefinition();
$ui = $definition2['ui'];
$columns = [];
foreach ($ui as $column => $def) {
    if (!empty($def['showInList'])) {
        $columns[] = [
            'title' => $definition2['labels'][$column],
            'name' => $column,
        ];
    }
}

?>

<table class="no-border">
    <tr>
        <th>
            Entidad
        </th>
        <td>
            <?= htmlentities($informe['entidad']) ?>
        </td>
        <th>
            Referencia
        </th>
        <td>
            <?= htmlentities($informe['referencia']) ?>
        </td>
    </tr>
    <tr>
        <th>
            Elaborado por
        </th>
        <td>
            <?= htmlentities($informe['elaborado_por']) ?>
        </td>
        <th>
            Fecha
        </th>
        <td>
            <?= htmlentities($informe['fecha']) ?>
        </td>
    </tr>
</table>
<br />
<table class="border">
    <tr>
        <?php
            foreach ($columns as $column) {
                ?>
        <th>
            <?= $column['title'] ?>
        </th>
        <?php
            }
            ?>
    </tr>
    <?php
    foreach ($movimientos as $movimiento) {
        ?>
    <tr>
        <?php
            foreach ($columns as $column) {
                ?>
        <td>
            <?= htmlentities($movimiento['attributes'][$column['name']]) ?>
        </td>
        <?php
            } ?>
    </tr>
    <?php
    }
    ?>
</table>