const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();

const { Op } = require('sequelize');

// Obtener productos (con búsqueda, paginación y filtro de bajo stock)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', lowStock } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        
        // Filtro de búsqueda
        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { id: { [Op.like]: `%${search}%` } }
            ];
        }
        
        // OPTIMIZACIÓN: Filtro de bajo stock en la base de datos
        if (lowStock) {
            whereClause.stock = {
                [Op.lte]: parseInt(lowStock)
            };
        }

        const { count, rows } = await Producto.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'nombre', 'stock', 'precioCosto', 'precioVenta', 'fechaAdquisicion'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['stock', 'ASC'], ['nombre', 'ASC']] // Ordenar por stock más bajo primero
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al obtener productos', details: err.message });
    }
});

// Crear un producto
router.post('/', async (req, res) => {
    try {
        const nuevoProducto = await Producto.create(req.body);
        res.status(201).json(nuevoProducto);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear producto' });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        await producto.update(req.body);
        res.json(producto);
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar producto' });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        await producto.destroy();
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;
