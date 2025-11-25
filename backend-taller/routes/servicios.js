const express = require('express');
const Servicio = require('../models/Servicio');
const router = express.Router();

// Obtener TODOS los servicios sin paginación (para formularios)
router.get('/all', async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            attributes: ['id', 'nombre', 'precio', 'descripcion'],
            order: [['nombre', 'ASC']]
        });
        res.json(servicios);
    } catch (err) {
        console.error('Error al obtener todos los servicios:', err);
        res.status(500).json({ error: 'Error al obtener servicios', details: err.message });
    }
});

// Obtener todos los servicios con paginación y búsqueda
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;
        const { Op } = require('sequelize');

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { descripcion: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Servicio.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'nombre', 'precio', 'descripcion'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['nombre', 'ASC']]
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
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
