const express = require('express');
const Usuario = require('../models/Usuario');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};
// Ruta de registro (sin autenticación)
router.post('/register', async (req, res) => {
    try {
        // Verificar si ya existe un usuario con ese email
        const existingUser = await Usuario.findOne({ where: { email: req.body.email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const nuevoUsuario = await Usuario.create(req.body);
        const { password, ...usuarioSinPassword } = nuevoUsuario.toJSON();
        res.status(201).json(usuarioSinPassword);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error al crear usuario', details: err.message });
    }
});

// Ruta de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await usuario.validarPassword(password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                rol: usuario.rol 
            }, 
            process.env.JWT_SECRET || 'CarServiceTitisSistema', // Asegúrate de tener JWT_SECRET en tu .env
            { expiresIn: '8h' }
        );

        res.json({ 
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor', details: error.message });
    }
});


// Obtener todos los usuarios
router.get('/', authenticateToken, async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Crear un usuario
router.post('/', authenticateToken, async (req, res) => {
    try {
        const nuevoUsuario = await Usuario.create(req.body);
        const { password, ...usuarioSinPassword } = nuevoUsuario.toJSON();
        res.status(201).json(usuarioSinPassword);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear usuario' });
    }
});

// Obtener un usuario por ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// Actualizar un usuario
router.put('/:id', authenticateToken, async (req, res) => {
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
router.delete('/:id', authenticateToken, async (req, res) => {
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
