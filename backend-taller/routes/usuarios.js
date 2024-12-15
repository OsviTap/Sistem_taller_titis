const express = require('express');
const Usuario = require('../models/Usuario');
const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Crear un usuario
router.post('/', async (req, res) => {
    try {
        const nuevoUsuario = await Usuario.create(req.body);
        res.status(201).json(nuevoUsuario);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear usuario' });
    }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        await usuario.update(req.body);
        res.json(usuario);
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar usuario' });
    }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        await usuario.destroy();
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;
