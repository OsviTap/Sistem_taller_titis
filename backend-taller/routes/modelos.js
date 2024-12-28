const express = require('express');
const { Modelo, Marca } = require('../models');
const router = express.Router();

// Obtener todos los modelos con sus marcas
router.get('/', async (req, res) => {
    try {
        const modelos = await Modelo.findAll({
            include: [{
                model: Marca,
                as: 'marca',
                attributes: ['nombre']  // Solo necesitamos el nombre
            }]
        });
        res.json(modelos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener modelos' });
    }
});

// Crear un modelo
router.post('/', async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);

        const { nombre, marcaId } = req.body;

        // Validaciones
        if (!nombre || !marcaId) {
            return res.status(400).json({ 
                error: 'Nombre y marcaId son requeridos',
                received: { nombre, marcaId }
            });
        }

        // Verificar que la marca existe
        const marcaExiste = await Marca.findOne({
            where: { nombre: marcaId }
        });

        if (!marcaExiste) {
            return res.status(400).json({ 
                error: 'La marca especificada no existe',
                marcaId: marcaId
            });
        }

        // Crear el modelo
        const nuevoModelo = await Modelo.create({
            nombre,
            marcaId
        });

        // Obtener el modelo con la información de la marca
        const modeloCreado = await Modelo.findByPk(nuevoModelo.id, {
            include: [{
                model: Marca,
                as: 'marca',
                attributes: ['nombre']
            }]
        });

        res.status(201).json(modeloCreado);
    } catch (err) {
        console.error('Error completo:', err);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Error de validación',
                details: err.errors.map(e => e.message)
            });
        }
        res.status(500).json({ 
            error: 'Error al crear modelo',
            details: err.message
        });
    }
});

// Actualizar un modelo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marcaId } = req.body;  // Usamos marcaId
        const modelo = await Modelo.findByPk(id);
        if (modelo) {
            await modelo.update({ 
                nombre, 
                marcaId  // Aquí también usamos marcaId
            });
            res.json(modelo);
        } else {
            res.status(404).json({ error: 'Modelo no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar modelo' });
    }
});

// Eliminar un modelo
router.delete('/:id', async (req, res) => {
    try {
        const modelo = await Modelo.findByPk(req.params.id);
        if (!modelo) return res.status(404).json({ error: 'Modelo no encontrado' });
        await modelo.destroy();
        res.json({ message: 'Modelo eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar modelo' });
    }
});

// Obtener las marcas de la tabla marcas
router.get('/marcas', async (req, res) => {
    try {
        // Asegúrate de que estás consultando el modelo correcto para las marcas
        const marcas = await Marca.findAll({ attributes: ['nombre'] }); // Cambia 'Marca' por el nombre de tu modelo de marcas
        res.json(marcas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener marcas' });
    }
});
router.get('/', async (req, res) => {
    try {
        const modelos = await Modelo.findAll({
            include: [{
                model: Marca,
                attributes: ['nombre']
            }]
        });
        res.json(modelos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener modelos' });
    }
});

// Obtener todas las marcas
router.get('/marcas', async (req, res) => {
    try {
        const marcas = await Marca.findAll();
        res.json(marcas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener marcas' });
    }
});
module.exports = router;
