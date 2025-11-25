const express = require('express');
const  Cliente  = require('../models/Cliente');
const Vehiculo  = require('../models/Vehiculo');
const Visita  = require('../models/Visita');
const Marca  = require('../models/Marca');
const Modelo  = require('../models/Modelo');
const { sequelize } = require('../models');
const router = express.Router();

// Obtener todos los clientes
// Obtener todos los clientes con paginación y búsqueda
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;
        const { Op } = require('sequelize');

        const whereClause = {
            estado: 1 // Solo traer clientes activos
        };

        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { telefono: { [Op.like]: `%${search}%` } },
                { nit: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Cliente.findAndCountAll({
            where: whereClause,
            include: [{
                model: Vehiculo,
                as: 'Vehiculos',
                where: { estado: 1 },
                required: false,
                include: [
                    { model: Marca, as: 'marcaVehiculo' },
                    { model: Modelo, as: 'modeloVehiculo' }
                ]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true // Importante para contar correctamente con includes
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// Crear un cliente
router.post('/', async (req, res) => {
    try {
        const { nombre, direccion, telefono, nit, Vehiculos } = req.body;
        
        const result = await sequelize.transaction(async (t) => {
            // Crear el cliente
            const cliente = await Cliente.create({
                nombre,
                direccion,
                telefono,
                nit,
                estado: 1
            }, { transaction: t });

            // Si hay vehículos, crearlos
            if (Vehiculos && Vehiculos.length > 0) {
                const vehiculosData = Vehiculos.map(v => ({
                    ...v,
                    clienteId: cliente.id
                }));
                await Vehiculo.bulkCreate(vehiculosData, { transaction: t });
            }

            return cliente;
        });

        // Obtener el cliente creado con sus vehículos
        const clienteCreado = await Cliente.findByPk(result.id, {
            include: [{
                model: Vehiculo,
                as: 'Vehiculos',
                include: [
                    { model: Marca, as: 'marcaVehiculo' },
                    { model: Modelo, as: 'modeloVehiculo' }
                ]
            }]
        });

        res.status(201).json(clienteCreado);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});

// Obtener un cliente por ID
router.get('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

// Actualizar un cliente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono, nit, Vehiculos } = req.body;

        console.log('Datos recibidos:', { id, nombre, direccion, telefono, nit, Vehiculos });

        const result = await sequelize.transaction(async (t) => {
            // Buscar el cliente
            const cliente = await Cliente.findByPk(id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            // Actualizar cliente
            await cliente.update({
                nombre,
                direccion,
                telefono,
                nit
            }, { transaction: t });

            // Actualizar vehículos de forma segura SIN eliminarlos
            if (Vehiculos && Vehiculos.length > 0) {
                // Obtener vehículos existentes del cliente
                const vehiculosExistentes = await Vehiculo.findAll({
                    where: { clienteId: id },
                    transaction: t
                });

                // Crear un mapa de vehículos existentes por placa para fácil búsqueda
                const vehiculosMap = new Map(
                    vehiculosExistentes.map(v => [v.placa, v])
                );

                // Array para rastrear qué vehículos del form ya procesamos
                const placasEnFormulario = new Set();

                // Procesar cada vehículo del formulario
                for (const vehiculoData of Vehiculos) {
                    placasEnFormulario.add(vehiculoData.placa);
                    
                    const vehiculoExistente = vehiculosMap.get(vehiculoData.placa);
                    
                    if (vehiculoExistente) {
                        // ACTUALIZAR vehículo existente (si cambió marca/modelo)
                        await vehiculoExistente.update({
                            marcaId: vehiculoData.marcaId,
                            modeloId: vehiculoData.modeloId,
                            placa: vehiculoData.placa
                        }, { transaction: t });
                    } else {
                        // CREAR nuevo vehículo
                        await Vehiculo.create({
                            clienteId: id,
                            marcaId: vehiculoData.marcaId,
                            modeloId: vehiculoData.modeloId,
                            placa: vehiculoData.placa
                        }, { transaction: t });
                    }
                }

                // ELIMINAR SOLO los vehículos que ya NO están en el formulario
                // Y que NO tienen visitas asociadas (para prevenir pérdida de datos)
                for (const vehiculoExistente of vehiculosExistentes) {
                    if (!placasEnFormulario.has(vehiculoExistente.placa)) {
                        // Verificar si el vehículo tiene visitas
                        const visitasCount = await Visita.count({
                            where: { vehiculoId: vehiculoExistente.id },
                            transaction: t
                        });

                        if (visitasCount > 0) {
                            // NO eliminar, solo marcar como inactivo
                            await vehiculoExistente.update({
                                estado: 0
                            }, { transaction: t });
                            
                            console.log(`Vehículo ${vehiculoExistente.placa} marcado como inactivo (tiene ${visitasCount} visitas)`);
                        } else {
                            // Seguro eliminar (no tiene visitas)
                            await vehiculoExistente.destroy({ transaction: t });
                            console.log(`Vehículo ${vehiculoExistente.placa} eliminado (sin visitas)`);
                        }
                    }
                }
            }

            return cliente;
        });

        // Obtener el cliente actualizado con sus vehículos
        const clienteActualizado = await Cliente.findByPk(id, {
            include: [{
                model: Vehiculo,
                as: 'Vehiculos',
                include: [
                    { model: Marca, as: 'marcaVehiculo' },
                    { model: Modelo, as: 'modeloVehiculo' }
                ]
            }]
        });

        res.json(clienteActualizado);
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ 
            error: 'Error al actualizar cliente',
            details: error.message,
            stack: error.stack
        });
    }
});



// Actualizar estado de un cliente (intercambiar entre 1 y 0)
router.patch('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        cliente.estado = cliente.estado === 1 ? 0 : 1; // Corregido
        await cliente.save();
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar estado del cliente' });
    }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await sequelize.transaction(async (t) => {
            // Buscar el cliente
            const cliente = await Cliente.findByPk(id);
            
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            // Actualizar el estado a 0 (eliminado lógico)
            await cliente.update({ estado: 0 }, { transaction: t });

            // También actualizar el estado de los vehículos asociados
            await Vehiculo.update(
                { estado: 0 },
                { 
                    where: { clienteId: id },
                    transaction: t 
                }
            );

            return cliente;
        });

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ 
            error: 'Error al eliminar cliente',
            details: error.message 
        });
    }
});

// mostrar vehiculos de un cliente
router.get('/vehiculo/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id, {
            include: [{
                model: Vehiculo,
                include: [
                    { model: Marca, as: 'marcaVehiculo' },
                    { model: Modelo, as: 'modeloVehiculo' }
                ]
            }]
        });
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        
        // Agregar logs para depuración
        console.log('Cliente encontrado:', cliente);
        console.log('Vehículos:', cliente.Vehiculos);
        
        res.json(cliente);
    } catch (err) {
        console.error('Error completo:', err);  // Ver el error completo
        res.status(500).json({ error: 'Error al obtener cliente', details: err.message });
    }
});

module.exports = router;
