const express = require('express');
const { Marca, Modelo } = require('../models');
const router = express.Router();

// Crear una nueva marca
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;
        const marca = await Marca.create({ nombre });
        res.status(201).json(marca);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear marca' });
    }
});

// Obtener todas las marcas con sus modelos
router.get('/', async (req, res) => {
    try {
        const marcas = await Marca.findAll({ include: { model: Modelo } });
        res.json(marcas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener marcas' });
    }
});

// Actualizar una marca
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const marca = await Marca.findByPk(id);
        if (marca) {
            marca.nombre = nombre;
            await marca.save();
            res.json(marca);
        } else {
            res.status(404).json({ error: 'Marca no encontrada' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar marca' });
    }
});

router.delete('/:id', async (req, res) => {
    try{
        const marca = await Marca.findByPk(req.params.id);
        if (!marca) return res.status(404).json({ error: 'Marca no encontrada' });
        await marca.destroy();
        res.json({ message: 'Marca eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar marca' });
    }
});

module.exports = router;
