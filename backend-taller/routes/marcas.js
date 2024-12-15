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

module.exports = router;
