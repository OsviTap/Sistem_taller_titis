const express = require('express');
const { Vehiculo, Marca, Modelo } = require('../models');
const router = express.Router();

// Crear un nuevo vehículo
router.post('/', async (req, res) => {
    try {
        const { clienteId, placa, marcaId, modeloId } = req.body;

        // Verificar existencia de marca y modelo por ID
        const marca = await Marca.findByPk(marcaId);
        const modelo = await Modelo.findByPk(modeloId);

        if (!marca || !modelo) {
            return res.status(400).json({ error: 'Marca o modelo no válido' });
        }

        const vehiculo = await Vehiculo.create({ clienteId, placa, marcaId, modeloId });
        res.status(201).json(vehiculo);
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar vehículo', details: err.message });
    }
});

// Obtener todos los vehículos con detalles de marca y modelo
router.get('/', async (req, res) => {
    try {
        const vehiculos = await Vehiculo.findAll({
            include: [
                { model: Marca, as: 'marcaVehiculo' },  // Cambiado el alias aquí
                { model: Modelo, as: 'modeloVehiculo' } // Cambiado el alias aquí también
            ],
        });
        res.json(vehiculos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener vehículos', details: err.message });
    }
});
// Actualizar un vehículo
router.put('/:id', async (req, res) => {
    try {
        const { clienteId, placa, marcaId, modeloId } = req.body;

        const vehiculo = await Vehiculo.findByPk(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        // Verificar que la marca y modelo existen
        const marca = await Marca.findByPk(marcaId);
        const modelo = await Modelo.findByPk(modeloId);

        if (!marca || !modelo) {
            return res.status(400).json({ error: 'Marca o modelo no válido' });
        }

        vehiculo.clienteId = clienteId || vehiculo.clienteId;
        vehiculo.placa = placa || vehiculo.placa;
        vehiculo.marcaId = marcaId || vehiculo.marcaId;
        vehiculo.modeloId = modeloId || vehiculo.modeloId;

        await vehiculo.save();
        res.json(vehiculo);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar vehículo', details: err.message });
    }
});

// Eliminar un vehículo
router.delete('/:id', async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findByPk(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        await vehiculo.destroy();
        res.json({ message: 'Vehículo eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar vehículo', details: err.message });
    }
});

// Obtener vehículos por cliente
router.get('/cliente/:clienteId', async (req, res) => {
    try {
        const vehiculos = await Vehiculo.findAll({
            where: { clienteId: req.params.clienteId },
            include: [
                { model: Marca, as: 'marcaVehiculo' },
                { model: Modelo, as: 'modeloVehiculo' }
            ]
        });
        res.json(vehiculos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener vehículos del cliente', details: err.message });
    }
});
module.exports = router;

