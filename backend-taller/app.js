var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const clientesRoutes = require('./routes/clientes');
const vehiculosRoutes = require('./routes/vehiculos');
const serviciosRoutes = require('./routes/servicios');
const visitasRoutes = require('./routes/visitas');
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');

//Sincronizacion de modelos
const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');
const Cliente = require('./models/Cliente');
const Vehiculo = require('./models/Vehiculo');
const Servicio = require('./models/Servicio');
const Visita = require('./models/Visita');
const Producto = require('./models/Producto');

sequelize.sync({ alter: true })
    .then(() => console.log('Modelos sincronizados con la base de datos.'))
    .catch(err => console.error('Error al sincronizar los modelos:', err));




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Registrar rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/visitas', visitasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Listener
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
