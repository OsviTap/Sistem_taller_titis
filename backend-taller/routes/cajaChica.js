const express = require('express');
const { CajaChica } = require('../models');
const router = express.Router();

// Apertura de caja chica
router.post('/apertura', async (req, res) => {
    try {
        const { fechaApertura, saldoInicial } = req.body;
        const caja = await CajaChica.create({ fechaApertura, saldoInicial });
        res.status(201).json(caja);
    } catch (err) {
        res.status(500).json({ error: 'Error al abrir caja chica' });
    }
});

// Cierre de caja chica
router.put('/cierre/:id', async (req, res) => {
    try {
        const { saldoFinal } = req.body;
        const caja = await CajaChica.findByPk(req.params.id);

        if (!caja || caja.fechaCierre) {
            return res.status(400).json({ error: 'Caja ya cerrada o inexistente' });
        }

        caja.saldoFinal = saldoFinal;
        caja.fechaCierre = new Date();
        await caja.save();

        res.json(caja);
    } catch (err) {
        res.status(500).json({ error: 'Error al cerrar caja chica' });
    }
});

module.exports = router;
