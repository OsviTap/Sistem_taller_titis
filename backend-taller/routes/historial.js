const express = require('express');
const { HistorialVisita, DetalleServicio, Cliente, Vehiculo, Producto, Servicio } = require('../models');
const router = express.Router();

// Crear un historial de visita
router.post('/', async (req, res) => {
    try {
        const { clienteId, vehiculoId, fechaVisita, kilometrajeActual, kilometrajeProximo, totalPagar, detalles } = req.body;

        const nuevaVisita = await HistorialVisita.create({
            clienteId, vehiculoId, fechaVisita, kilometrajeActual, kilometrajeProximo, totalPagar,
        });

        if (detalles && detalles.length > 0) {
            for (const detalle of detalles) {
                await DetalleServicio.create({
                    historial_id: nuevaVisita.id,
                    servicio_id: detalle.servicioId,
                    producto_id: detalle.productoId,
                    cantidad: detalle.cantidad,
                    precio: detalle.precio,
                });
            }
        }

        res.status(201).json(nuevaVisita);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el historial de visita' });
    }
});

// Obtener historial detallado
router.get('/:id', async (req, res) => {
    try {
        const historial = await HistorialVisita.findByPk(req.params.id, {
            include: [
                { model: Cliente },
                { model: Vehiculo },
                { model: DetalleServicio, include: [Servicio, Producto] },
            ],
        });
        if (!historial) return res.status(404).json({ error: 'Historial no encontrado' });
        res.json(historial);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// Eliminar historial
router.delete('/:id', async (req, res) => {
    try {
        const historial = await HistorialVisita.findByPk(req.params.id);
        if (!historial) return res.status(404).json({ error: 'Historial no encontrado' });

        await historial.destroy();
        res.json({ message: 'Historial eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar historial' });
    }
});

module.exports = router;
