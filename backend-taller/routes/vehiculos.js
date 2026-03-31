const express = require('express');
const { Vehiculo, Marca, Modelo } = require('../models');
const router = express.Router();

// Crear un nuevo vehículo
router.post('/', async (req, res) => {
    try {
        const { clienteId, placa, marcaId, modeloId, anio } = req.body;

        const anioNormalizado = parseInt(anio, 10);
        const anioMaximo = new Date().getFullYear() + 1;
        if (Number.isNaN(anioNormalizado) || anioNormalizado < 1900 || anioNormalizado > anioMaximo) {
            return res.status(400).json({ error: `Año no válido. Debe estar entre 1900 y ${anioMaximo}` });
        }

        // Verificar existencia de marca y modelo por ID
        const marca = await Marca.findByPk(marcaId);
        const modelo = await Modelo.findByPk(modeloId);

        if (!marca || !modelo) {
            return res.status(400).json({ error: 'Marca o modelo no válido' });
        }

        const vehiculo = await Vehiculo.create({ clienteId, placa, marcaId, modeloId, anio: anioNormalizado });
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
        const { clienteId, placa, marcaId, modeloId, anio } = req.body;

        const vehiculo = await Vehiculo.findByPk(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const marcaObjetivo = marcaId ?? vehiculo.marcaId;
        const modeloObjetivo = modeloId ?? vehiculo.modeloId;

        // Verificar que la marca y modelo existen
        const marca = await Marca.findByPk(marcaObjetivo);
        const modelo = await Modelo.findByPk(modeloObjetivo);

        if (!marca || !modelo) {
            return res.status(400).json({ error: 'Marca o modelo no válido' });
        }

        if (anio !== undefined) {
            const anioNormalizado = parseInt(anio, 10);
            const anioMaximo = new Date().getFullYear() + 1;
            if (Number.isNaN(anioNormalizado) || anioNormalizado < 1900 || anioNormalizado > anioMaximo) {
                return res.status(400).json({ error: `Año no válido. Debe estar entre 1900 y ${anioMaximo}` });
            }
            vehiculo.anio = anioNormalizado;
        }

        vehiculo.clienteId = clienteId ?? vehiculo.clienteId;
        vehiculo.placa = placa ?? vehiculo.placa;
        vehiculo.marcaId = marcaObjetivo;
        vehiculo.modeloId = modeloObjetivo;

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

