const express = require('express');
const { Vehiculo, Marca, Modelo } = require('../models');
const router = express.Router();

// Crear un nuevo vehículo
router.post('/', async (req, res) => {
    try {
        const { cliente_id, placa, marca_id, modelo_id } = req.body;

        // Verificar que la marca y modelo existen
        const marca = await Marca.findByPk(marca_id);
        const modelo = await Modelo.findByPk(modelo_id);

        if (!marca || !modelo) {
            return res.status(400).json({ error: 'Marca o modelo no válido' });
        }

        const vehiculo = await Vehiculo.create({ cliente_id, placa, marca_id, modelo_id });
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
                { model: Marca, as: 'marca' },
                { model: Modelo, as: 'modelo' },
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
        const { cliente_id, placa, marca_id, modelo_id } = req.body;

        const vehiculo = await Vehiculo.findByPk(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        // Verificar que la marca y modelo existen
        const marca = await Marca.findByPk(marca_id);
        const modelo = await Modelo.findByPk(modelo_id);

        if (!marca || !modelo) {
            return res.status(400).json({ error: 'Marca o modelo no válido' });
        }

        vehiculo.cliente_id = cliente_id || vehiculo.cliente_id;
        vehiculo.placa = placa || vehiculo.placa;
        vehiculo.marca_id = marca_id || vehiculo.marca_id;
        vehiculo.modelo_id = modelo_id || vehiculo.modelo_id;

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

module.exports = router;

