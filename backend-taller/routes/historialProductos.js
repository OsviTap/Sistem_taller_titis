const express = require('express');
const { ProductHistory, Producto, Cliente, Vehiculo, Marca, Modelo } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Obtener historial de productos con filtros
router.get('/', async (req, res) => {
    try {
        const { year, month } = req.query;
        let whereClause = {};

        if (year && month) {
            // Filtro por mes específico
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            whereClause.fechaSalida = {
                [Op.between]: [startDate, endDate]
            };
        } else if (year) {
            // Filtro por año
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            whereClause.fechaSalida = {
                [Op.between]: [startDate, endDate]
            };
        }

        const historial = await ProductHistory.findAll({
            where: whereClause,
            include: [
                {
                    model: Producto,
                    attributes: ['nombre']
                },
                {
                    model: Cliente,
                    attributes: ['nombre']
                },
                {
                    model: Vehiculo,
                    include: [
                        {
                            model: Marca,
                            as: 'marcaVehiculo',
                            attributes: ['nombre']
                        },
                        {
                            model: Modelo,
                            as: 'modeloVehiculo',
                            attributes: ['nombre']
                        }
                    ]
                }
            ],
            order: [['fechaSalida', 'DESC']]
        });

        // Calcular totales
        const totales = historial.reduce((acc, record) => {
            acc.totalVendido += parseFloat(record.precioVenta) * record.cantidad;
            acc.totalCosto += parseFloat(record.precioCosto) * record.cantidad;
            acc.totalDescuento += parseFloat(record.descuento);
            acc.gananciaTotal += parseFloat(record.ganancia);
            return acc;
        }, {
            totalVendido: 0,
            totalCosto: 0,
            totalDescuento: 0,
            gananciaTotal: 0
        });

        res.json({
            historial,
            totales
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial de productos' });
    }
});

router.get('/totales', async (req, res) => {
    try {
        const { periodo } = req.query;
        let fechaInicio = new Date();
        
        switch(periodo) {
            case 'day':
                fechaInicio.setHours(0,0,0,0);
                break;
            case 'week':
                fechaInicio.setDate(fechaInicio.getDate() - 7);
                break;
            case 'month':
                fechaInicio.setMonth(fechaInicio.getMonth() - 1);
                break;
            case 'year':
                fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
                break;
        }

        const historial = await ProductHistory.findAll({
            where: {
                fechaSalida: {
                    [Op.gte]: fechaInicio
                }
            },
            attributes: [
                'precioVenta',
                'precioCosto',
                'cantidad',
                'descuento',
                'ganancia'
            ]
        });

        const totales = historial.reduce((acc, curr) => ({
            totalVendido: acc.totalVendido + (parseFloat(curr.precioVenta) * curr.cantidad),
            totalCosto: acc.totalCosto + (parseFloat(curr.precioCosto) * curr.cantidad),
            totalDescuento: acc.totalDescuento + (parseFloat(curr.descuento || 0)),
            gananciaTotal: acc.gananciaTotal + parseFloat(curr.ganancia || 0)
        }), {
            totalVendido: 0,
            totalCosto: 0,
            totalDescuento: 0,
            gananciaTotal: 0
        });

        res.json(totales);
    } catch (err) {
        console.error('Error al obtener totales:', err);
        res.status(500).json({ error: 'Error al obtener totales' });
    }
});

// Crear registro en historial
router.post('/', async (req, res) => {
    try {
        const {
            fechaSalida,
            cantidad,
            precioCosto,
            precioVenta,
            descuento,
            productoId,
            clienteId,
            vehiculoId,
            visitaId
        } = req.body;

        // Calcular ganancia
        const ganancia = (precioVenta * cantidad) - (precioCosto * cantidad) - descuento;

        const nuevoHistorial = await ProductHistory.create({
            fechaSalida,
            cantidad,
            precioCosto,
            precioVenta,
            descuento,
            ganancia,
            productoId,
            clienteId,
            vehiculoId,
            visitaId
        });

        res.status(201).json(nuevoHistorial);
    } catch (error) {
        console.error('Error al crear registro:', error);
        res.status(500).json({ error: 'Error al crear registro en historial' });
    }
});

module.exports = router;