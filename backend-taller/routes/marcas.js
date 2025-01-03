const express = require('express');
const { Marca, Modelo } = require('../models');
const router = express.Router();

///////////////////////
// Crear una nueva marca
///////////////////////
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;

        // Validar datos
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio.' });
        }

        const marca = await Marca.create({ nombre });
        res.status(201).json(marca);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear marca', details: err.message });
    }
});

///////////////////////
// Obtener todas las marcas con modelos
///////////////////////
router.get('/', async (req, res) => {
    try {
        const marcas = await Marca.findAll({
            attributes: ['id', 'nombre'], // Seleccionamos solo los campos necesarios de Marca
            include: {
                model: Modelo,
                as: 'modelos', // Alias definido en las asociaciones Sequelize
                attributes: ['id', 'nombre'] // Campos específicos de Modelo
            }
        });
        res.json(marcas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener marcas', details: err.message });
    }
});

///////////////////////
// Obtener una marca por ID con modelos
///////////////////////
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const marca = await Marca.findByPk(id, {
            attributes: ['id', 'nombre'], // Seleccionamos campos de Marca
            include: {
                model: Modelo,
                as: 'modelos', // Alias definido en Sequelize
                attributes: ['id', 'nombre'] // Campos específicos de Modelo
            }
        });

        if (!marca) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }

        res.json(marca);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la marca', details: err.message });
    }
});

///////////////////////
// Actualizar una marca
///////////////////////
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const marca = await Marca.findByPk(id);
        if (!marca) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }

        // Validar entrada
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio.' });
        }

        // Actualizar y guardar
        marca.nombre = nombre;
        await marca.save();

        res.json(marca);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar marca', details: err.message });
    }
});

///////////////////////
// Eliminar una marca
///////////////////////
router.delete('/:id', async (req, res) => {
    try {
        const marca = await Marca.findByPk(req.params.id);

        if (!marca) {
            return res.status(404).json({ error: 'Marca no encontrada' });
        }

        await marca.destroy();
        res.json({ message: 'Marca eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar marca', details: err.message });
    }
});

module.exports = router;