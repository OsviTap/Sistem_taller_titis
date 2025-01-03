const express = require('express');
const router = express.Router();
const { DetalleVisita, Servicio, Producto } = require('../models');

// Obtener todos los detalles de una visita
router.get('/visita/:visitaId', async (req, res) => {
    try {
        const detalles = await DetalleVisita.findAll({
            where: {
                visitaId: req.params.visitaId,
                estado: 1
            },
            include: [
                {
                    model: Servicio,
                    as: 'servicio',
                    required: false
                },
                {
                    model: Producto,
                    as: 'producto',
                    required: false
                }
            ]
        });
        res.json(detalles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener detalles de la visita' });
    }
});

// Crear un detalle de visita
router.post('/', async (req, res) => {
    try {
        const { visitaId, tipo, itemId, precio, cantidad } = req.body;
        const subtotal = precio * cantidad;

        const detalle = await DetalleVisita.create({
            visitaId,
            tipo,
            itemId,
            precio,
            cantidad,
            subtotal,
            estado: 1
        });

        res.status(201).json(detalle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear detalle de visita' });
    }
});

// Actualizar un detalle de visita
router.put('/:id', async (req, res) => {
    try {
        const detalle = await DetalleVisita.findByPk(req.params.id);
        if (!detalle) {
            return res.status(404).json({ error: 'Detalle no encontrado' });
        }

        const { precio, cantidad } = req.body;
        const subtotal = precio * cantidad;

        await detalle.update({
            ...req.body,
            subtotal
        });

        res.json(detalle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar detalle de visita' });
    }
});

// Eliminar un detalle de visita (borrado lógico)
router.delete('/:id', async (req, res) => {
    try {
        const detalle = await DetalleVisita.findByPk(req.params.id);
        if (!detalle) {
            return res.status(404).json({ error: 'Detalle no encontrado' });
        }

        await detalle.update({ estado: 0 });
        res.json({ message: 'Detalle eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar detalle de visita' });
    }
});

module.exports = router;