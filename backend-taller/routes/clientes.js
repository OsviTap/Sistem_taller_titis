const express = require('express');
const  Cliente  = require('../models/Cliente');
const Vehiculo  = require('../models/Vehiculo');
const Marca  = require('../models/Marca');
const Modelo  = require('../models/Modelo');
const { sequelize } = require('../models');
const router = express.Router();

// Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            where: {
                estado: 1 // Solo traer clientes activos
            },
            include: [{
                model: Vehiculo,
                as: 'Vehiculos',
                where: { estado: 1 }, // Solo traer vehículos activos
                required: false,
                include: [
                    { model: Marca, as: 'marcaVehiculo' },
                    { model: Modelo, as: 'modeloVehiculo' }
                ]
            }]
        });
        res.json(clientes);
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

            // Actualizar vehículos
            if (Vehiculos && Vehiculos.length > 0) {
                // Eliminar vehículos existentes
                await Vehiculo.destroy({
                    where: { clienteId: id },
                    transaction: t
                });

                // Crear nuevos vehículos
                const vehiculosData = Vehiculos.map(v => ({
                    clienteId: id,
                    marcaId: v.marcaId,
                    modeloId: v.modeloId,
                    placa: v.placa
                }));

                await Vehiculo.bulkCreate(vehiculosData, { transaction: t });
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
