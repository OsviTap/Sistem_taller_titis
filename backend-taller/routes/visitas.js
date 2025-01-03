const express = require('express');
const { Visita, DetalleVisita, Cliente, Vehiculo, Producto, HistorialVisita } = require('../models');
const router = express.Router();
const { sequelize } = require('../models');

// Obtener todas las visitas
router.get('/', async (req, res) => {
    try {
        const visitas = await Visita.findAll({
            include: [
                { model: Cliente },
                { model: Vehiculo },
                { 
                    model: DetalleVisita,
                    as: 'detalles'
                }
            ],
            order: [['fecha', 'DESC']]
        });
        res.json(visitas);
    } catch (error) {
        console.error('Error al obtener visitas:', error);
        res.status(500).json({ error: 'Error al obtener visitas' });
    }
});

// Crear una visita
router.post('/', async (req, res) => {
    const t = await sequelize.transaction();

    try {
        // 1. Crear la visita
        const visita = await Visita.create({
            clienteId: req.body.clienteId,
            vehiculoId: req.body.vehiculoId,
            fecha: req.body.fecha || new Date(),
            kilometraje: req.body.kilometraje,
            proximoCambio: req.body.proximoCambio,
            tipoPago: req.body.tipoPago,
            descuento: req.body.descuento || 0,
            total: req.body.total
        }, { transaction: t });

        // 2. Crear los detalles y actualizar stock
        if (req.body.detalles && req.body.detalles.length > 0) {
            for (const detalle of req.body.detalles) {
                await DetalleVisita.create({
                    visitaId: visita.id,
                    tipo: detalle.tipo,
                    itemId: detalle.itemId,
                    precio: detalle.precio,
                    cantidad: detalle.cantidad || 1,
                    subtotal: detalle.precio * (detalle.cantidad || 1),
                    estado: 1
                }, { transaction: t });

                // Si es un producto, actualizar el stock
                if (detalle.tipo === 'Producto') {
                    const producto = await Producto.findByPk(detalle.itemId, { transaction: t });
                    if (producto) {
                        const nuevoStock = producto.stock - detalle.cantidad;
                        if (nuevoStock < 0) {
                            throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
                        }
                        await producto.update({ stock: nuevoStock }, { transaction: t });
                    }
                }
            }
        }

        // 3. Crear el historial de visita
        await HistorialVisita.create({
            clienteId: req.body.clienteId,
            vehiculoId: req.body.vehiculoId,
            visitaId: visita.id,
            fecha: visita.fecha,
            kilometraje: visita.kilometraje,
            proximoCambio: visita.proximoCambio,
            total: visita.total,
            tipoPago: visita.tipoPago,
            descuento: visita.descuento
        }, { transaction: t });

        // 4. Confirmar la transacción
        await t.commit();

        // 5. Emitir evento WebSocket para actualizar la tabla de productos
        req.app.get('io').emit('stockUpdated');

        // 6. Obtener la visita completa con sus detalles
        const visitaCompleta = await Visita.findByPk(visita.id, {
            include: [
                { model: Cliente },
                { model: Vehiculo },
                { model: DetalleVisita, as: 'detalles' }
            ]
        });

        res.status(201).json(visitaCompleta);

    } catch (error) {
        await t.rollback();
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Error al crear la visita',
            details: error.message 
        });
    }
});

// Obtener una visita por ID
router.get('/:id', async (req, res) => {
    try {
        const visita = await Visita.findByPk(req.params.id, { include: Servicio });
        if (!visita) return res.status(404).json({ error: 'Visita no encontrada' });
        res.json(visita);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener visita' });
    }
});

// Eliminar una visita
router.delete('/:id', async (req, res) => {
    try {
        const visita = await Visita.findByPk(req.params.id);
        if (!visita) return res.status(404).json({ error: 'Visita no encontrada' });

        await visita.destroy();
        res.json({ message: 'Visita eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar visita' });
    }
});

module.exports = router;
