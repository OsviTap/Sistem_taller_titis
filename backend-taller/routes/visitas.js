const express = require('express');
const Visita = require('../models/Visita');
const Servicio = require('../models/Servicio');
const router = express.Router();

// Obtener todas las visitas
router.get('/', async (req, res) => {
    try {
        const visitas = await Visita.findAll({ include: Servicio });
        res.json(visitas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener visitas' });
    }
});

// Crear una visita
router.post('/', async (req, res) => {
    try {
        const { clienteId, vehiculoId, servicios } = req.body;

        // Crear la visita
        const nuevaVisita = await Visita.create({ clienteId, vehiculoId });

        // Asociar servicios a la visita
        if (servicios && servicios.length > 0) {
            const serviciosAsociados = await Servicio.findAll({
                where: { id: servicios },
            });
            await nuevaVisita.addServicios(serviciosAsociados);
        }

        res.status(201).json(nuevaVisita);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear visita' });
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
