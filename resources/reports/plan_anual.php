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
<div style="display:flex;">
    <h3 style="flex-grow: 1;">
        <?= htmlentities($header['titulo']) ?><br>
        <small><?= htmlentities($header['periodo']) ?></small>
    </h3>
    <h3>
        Ref: <?= htmlentities($header['referencia']) ?>
    </h3>
</div>

<table class="no-border">
    <tr>
        <td>
            <b>Elaborado por:</b>
            <?= htmlentities($header['elaborado_por']) ?>
        </td>
        <td align="right">
            <b>Fecha:</b>
            <?= htmlentities($header['fecha']) ?>
        </td>
    </tr>
</table>
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
    $previous = null;
    $groupColumns = [
        'objetivo'
    ];
    foreach ($rows as $index => $row) {
        ?>
    <tr>
        <?php
            foreach ($columns as $column) {
                $rowspan = 1;
                $groupColumn = in_array($column['name'], $groupColumns);
                $isEqualToPrevious = $previous &&  $previous['attributes'][$column['name']] === $row['attributes'][$column['name']];
                if ($groupColumn && !$isEqualToPrevious) {
                    // calculate rowspan
                    $rowspan = 1;
                    $current = $row['attributes'][$column['name']];
                    foreach ($rows as $index2 => $row2) {
                        if ($index2 <= $index) {
                            continue;
                        }
                        if ($row2['attributes'][$column['name']] === $current) {
                            $rowspan++;
                        } else {
                            break;
                        }
                    }
                }
                if (!$groupColumn || !$isEqualToPrevious) {
                    echo '<td ' . ($rowspan > 1 ? 'rowspan="' . $rowspan . '"' : '') . '>';
                    echo htmlentities($row['attributes'][$column['name']]);
                    echo '</td>';
                }
            } ?>
    </tr>
    <?php
        $previous = $row;
    }
    ?>
</table>