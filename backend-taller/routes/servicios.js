const express = require('express');
const Servicio = require('../models/Servicio');
const router = express.Router();

// Obtener todos los servicios
router.get('/', async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            attributes: ['id', 'nombre', 'precio', 'descripcion']
        });
        console.log('Servicios encontrados:', JSON.stringify(servicios, null, 2));
        res.json(servicios);
    } catch (err) {
        console.error('Error al obtener servicios:', err);
        res.status(500).json({ error: 'Error al obtener servicios', details: err.message });
    }
});

// Crear un servicio
router.post('/', async (req, res) => {
    try {
        const nuevoServicio = await Servicio.create(req.body);
        res.status(201).json(nuevoServicio);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear servicio' });
    }
});

// Obtener un servicio por ID
router.get('/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
        res.json(servicio);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener servicio' });
    }
});

// Actualizar un servicio
router.put('/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });

        await servicio.update(req.body);
        res.json(servicio);
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar servicio' });
    }
});

// Eliminar un servicio
router.delete('/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });

        await servicio.destroy();
        res.json({ message: 'Servicio eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar servicio' });
    }
});

module.exports = router;
