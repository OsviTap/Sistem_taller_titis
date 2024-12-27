const express = require('express');
const  Cliente  = require('../models/Cliente');
const router = express.Router();

// Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
      const clientes = await Cliente.findAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Crear un cliente
router.post('/', async (req, res) => {
    try {
        const nuevoCliente = await Cliente.create(req.body);
        res.status(201).json(nuevoCliente);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear cliente' });
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
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        await cliente.update(req.body);
        res.json(cliente);
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar cliente' });
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
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        await cliente.destroy();
        res.json({ message: 'Cliente eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

module.exports = router;
