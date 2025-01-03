const express = require('express');
const { Modelo, Marca } = require('../models');
const router = express.Router();

//////////////////////////
// Obtener todos los modelos con su marca
//////////////////////////
router.get('/', async (req, res) => {
    try {
        const { marca_id } = req.query;
        const where = marca_id ? { marcaId: marca_id } : {};
        
        const modelos = await Modelo.findAll({
            where,
            include: [{
                model: Marca,
                as: 'marcaModelo'
            }]
        });
        res.json(modelos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener modelos', details: err.message });
    }
});

//////////////////////////
// Obtener un modelo por ID
//////////////////////////
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const modelo = await Modelo.findByPk(id, {
            attributes: ['id', 'nombre'],
            include: [{
                model: Marca,
                as: 'marca',
                attributes: ['id', 'nombre']
            }]
        });

        if (!modelo) {
            return res.status(404).json({ error: 'Modelo no encontrado' });
        }

        res.json(modelo);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener modelo', details: err.message });
    }
});

//////////////////////////
// Crear un nuevo modelo
//////////////////////////
router.post('/', async (req, res) => {
    try {
        const { nombre, marcaId } = req.body;

        // Validar entrada
        if (!nombre || !marcaId) {
            return res.status(400).json({ error: 'Nombre y marcaId son requeridos.' });
        }

        // Verificar existencia de la marca por ID
        const marca = await Marca.findByPk(marcaId);
        if (!marca) {
            return res.status(400).json({ error: 'Marca no encontrada.' });
        }

        // Crear el modelo
        const nuevoModelo = await Modelo.create({ nombre, marcaId });

        // Devolver el modelo con los detalles de la marca
        const modeloCreado = await Modelo.findByPk(nuevoModelo.id, {
            include: [{
                model: Marca,
                as: 'marca',
                attributes: ['id', 'nombre']
            }]
        });

        res.status(201).json(modeloCreado);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear modelo', details: err.message });
    }
});

//////////////////////////
// Actualizar un modelo
//////////////////////////
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marcaId } = req.body;

        const modelo = await Modelo.findByPk(id);
        if (!modelo) {
            return res.status(404).json({ error: 'Modelo no encontrado.' });
        }

        // Verificar si la marca existe
        if (marcaId) {
            const marca = await Marca.findByPk(marcaId);
            if (!marca) {
                return res.status(400).json({ error: 'Marca no encontrada.' });
            }
        }

        // Actualizar el modelo
        await modelo.update({ nombre, marcaId });
        res.json(modelo);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar modelo', details: err.message });
    }
});

//////////////////////////
// Eliminar un modelo
//////////////////////////
router.delete('/:id', async (req, res) => {
    try {
        const modelo = await Modelo.findByPk(req.params.id);
        if (!modelo) {
            return res.status(404).json({ error: 'Modelo no encontrado.' });
        }

        await modelo.destroy();
        res.json({ message: 'Modelo eliminado exitosamente.' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar modelo', details: err.message });
    }
});

// Obtener modelos por marca
router.get('/marca/:marcaId', async (req, res) => {
    try {
        const modelos = await Modelo.findAll({
            where: { marcaId: req.params.marcaId },
            include: [{
                model: Marca,
                as: 'marcaModelo'
            }]
        });
        res.json(modelos);
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al obtener modelos de la marca', 
            details: err.message 
        });
    }
});

//////////////////////////
// Obtener todas las marcas
//////////////////////////
router.get('/marcas', async (req, res) => {
    try {
        const marcas = await Marca.findAll({
            attributes: ['id', 'nombre'] // Solo seleccionamos ID y nombre
        });
        res.json(marcas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener marcas', details: err.message });
    }
});

module.exports = router;
