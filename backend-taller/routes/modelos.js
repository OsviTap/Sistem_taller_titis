const express = require('express');
const { Modelo } = require('../models');
const router = express.Router();

// Crear un modelo para una marca
router.post('/', async (req, res) => {
    try {
        const { nombre, marca_id } = req.body;
        const modelo = await Modelo.create({ nombre, marca_id });
        res.status(201).json(modelo);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear modelo' });
    }
});

module.exports = router;
