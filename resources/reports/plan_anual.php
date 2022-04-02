<?php

global $connection;

$model = model('plan_anual', $connection, $this->request);
$model2 = model('actividades', $connection, $this->request);
$report = $model->show($id);
$header = $report['data']['attributes'];
$detail = $model2->index(['params'=>['plan_anual_id' => $id]]);
$rows = $detail['data'];
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
<div>
    Ref: <?= htmlentities($header['referencia']) ?>
</div>
<h2>
    <?= htmlentities($header['titulo']) ?>
</h2>
<div><?= htmlentities($header['periodo']) ?></div>
<table class="no-border">
    <tr>
        <td>
            Elaborado por
            <?= htmlentities($header['elaborado_por']) ?>
        </td>
        <th>
            Fecha
        </th>
        <td>
            <?= htmlentities($header['fecha']) ?>
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
    foreach ($rows as $row) {
        ?>
    <tr>
        <?php
            foreach ($columns as $column) {
                ?>
        <td>
            <?= htmlentities($row['attributes'][$column['name']]) ?>
        </td>
        <?php
            } ?>
    </tr>
    <?php
    }
    ?>
</table>