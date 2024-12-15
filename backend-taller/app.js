var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('./models');
const router = express.Router();
const sequelize = require('./config/database');



var app = express();
const PORT = process.env.PORT || 3001;


const JWT_SECRET = 'secreto_super_seguro'; // Usar variables de entorno en producción

// Rutas
const clienteRoutes = require('./routes/clientes');
const vehiculoRoutes = require('./routes/vehiculos');
const marcaRoutes = require('./routes/marcas');
const modeloRoutes = require('./routes/modelos');
const productoRoutes = require('./routes/productos');
const servicioRoutes = require('./routes/servicios');
const usuarioRoutes = require('./routes/usuarios');
const historialRoutes = require('./routes/historial');
const visitaRoutes = require('./routes/visitas');
const cajaChicaRoutes = require('./routes/cajaChica');


// Sincronizar modelos y base de datos
(async () => {
    try {
        console.log('Iniciando sincronización de la base de datos...');
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');

        // Sincronización de modelos (actualizar estructura)
        await sequelize.sync({ alter: true }); 
        console.log('Modelos sincronizados correctamente.');

    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
})();

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const usuario = await Usuario.create({ nombre, email, password: hashedPassword, rol });
        res.status(201).json({ message: 'Usuario registrado exitosamente', usuario });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar usuario', details: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión', details: err.message });
    }
});



app.use(cors());
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Registrar rutas
app.use('/api/clientes', clienteRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/modelos', modeloRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/historiales', historialRoutes);
app.use('/api/visitas', visitaRoutes);
app.use('/api/caja-chica', cajaChicaRoutes);

// Listener
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
