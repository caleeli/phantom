<?php

namespace App\Resources;

interface JsonApiResourceInterface
{
    /**
     * Obtiene un listado de todos los elementos de la tabla
     */
    public function index(array $options = []);

    /**
     * Obtiene un elemento de la tabla
     */
    public function show($id);

    /**
     * Crea un nuevo elemento en la tabla
     */
    public function store(array $data);

    /**
     * Actualiza un elemento en la tabla
     */
    public function update($id, array $data);

    /**
     * Elimina un elemento de la tabla
     */
    public function destroy($id);
}
