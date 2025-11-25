const express = require('express');
const { HistorialVisita, DetalleServicio, Cliente, Vehiculo, Producto, Servicio, Marca, Modelo, DetalleVisita, Visita } = require('../models');
const Sequelize = require('sequelize');
const router = express.Router();

// Crear un historial de visita
router.post('/', async (req, res) => {
    try {
        const { 
            clienteId, 
            vehiculoId, 
            fecha, 
            kilometraje, 
            proximoCambio, 
            total,
            tipoPago,
            descuento,
            visitaId  // Este es el ID que viene del request
        } = req.body;

        // Primero verificamos que la visita existe
        const visitaExistente = await Visita.findByPk(visitaId);
        if (!visitaExistente) {
            return res.status(404).json({ error: 'La visita especificada no existe' });
        }

        // Creamos el historial asegurándonos que el visitaId se incluye
        const nuevoHistorial = await HistorialVisita.create({
            clienteId,
            vehiculoId,
            fecha,
            kilometraje,
            proximoCambio,
            total,
            tipoPago,
            descuento,
            visitaId: visitaId  // Asignación explícita del visitaId
        }, {
            returning: true  // Esto asegura que obtengamos el objeto creado completo
        });

        // Obtener el historial con todos sus datos relacionados
        const historialCompleto = await HistorialVisita.findByPk(nuevoHistorial.id, {
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'telefono', 'nit']
                },
                {
                    model: Vehiculo,
                    include: [
                        {
                            model: Marca,
                            as: 'marcaVehiculo'
                        },
                        {
                            model: Modelo,
                            as: 'modeloVehiculo'
                        }
                    ]
                },
                {
                    model: Visita,
                    as: 'visita',
                    include: [
                        {
                            model: DetalleVisita,
                            as: 'detalles',
                            include: [
                                {
                                    model: Servicio,
                                    as: 'servicio'
                                },
                                {
                                    model: Producto,
                                    as: 'producto'
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        res.status(201).json(historialCompleto);
    } catch (err) {
        console.error('Error al crear historial:', err);
        res.status(500).json({ 
            error: 'Error al crear el historial', 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Sequelize.Op.or] = [
                { '$Cliente.nombre$': { [Sequelize.Op.like]: `%${search}%` } },
                { '$Vehiculo.placa$': { [Sequelize.Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await HistorialVisita.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'telefono', 'nit'],
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
                    ],
                    attributes: ['placa']
                },
                {
                    model: Visita,
                    as: 'visita',
                    include: [
                        {
                            model: DetalleVisita,
                            as: 'detalles',
                            where: { estado: 1 },
                            required: false,
                            include: [
                                {
                                    model: Servicio,
                                    as: 'servicio',
                                    attributes: ['id', 'nombre', 'precio'],
                                    required: false,
                                    where: Sequelize.literal('`visita->detalles`.`tipo` = "Servicio"')
                                },
                                {
                                    model: Producto,
                                    as: 'producto',
                                    attributes: ['id', 'nombre', 'precioVenta'],
                                    required: false,
                                    where: Sequelize.literal('`visita->detalles`.`tipo` = "Producto"')
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['fecha', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true // Important for correct count with includes
        });

        // Transformar la respuesta para mantener la estructura original
        const transformedHistorial = rows.map(item => {
            const plainItem = item.get({ plain: true });
            return {
                ...plainItem,
                detalles: plainItem.visita?.detalles || []
            };
        });

        res.json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: transformedHistorial
        });
    } catch (err) {
        console.error('Error al obtener historial:', err);
        res.status(500).json({ error: 'Error al obtener historial', details: err.message });
    }
});

// Obtener historial detallado
// router.get('/', async (req, res) => {
//     try {
//         const historial = await HistorialVisita.findAll({
//             include: [
//                 { 
//                     model: Cliente,
//                     attributes: ['nombre']
//                 },
//                 { 
//                     model: Vehiculo,
//                     include: [
//                         {
//                             model: Marca,
//                             as: 'marcaVehiculo',
//                             attributes: ['nombre']
//                         },
//                         {
//                             model: Modelo,
//                             as: 'modeloVehiculo',
//                             attributes: ['nombre']
//                         }
//                     ],
//                     attributes: ['placa']
//                 },
//                 { 
//                     model: DetalleVisita,
//                     as: 'detalles',
//                     include: [
//                         {
//                             model: Servicio,
//                             as: 'servicio',
//                             attributes: ['nombre', 'precio']
//                         },
//                         {
//                             model: Producto,
//                             as: 'producto',
//                             attributes: ['nombre', 'precioVenta']
//                         }
//                     ]
//                 }
//             ],
//             order: [['fecha', 'DESC']]
//         });
//         res.json(historial);
//     } catch (err) {
//         res.status(500).json({ error: 'Error al obtener historial' });
//     }
// });

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
