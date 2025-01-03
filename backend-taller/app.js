var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('./models');
const router = express.Router();
const sequelize = require('./config/database');
var app = express();
// const PORT = process.env.PORT || 3001;

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'CarServiceTitisSistema';







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
const detalleVisitasRouter = require('./routes/detalleVisitas');
const historialProductosRouter = require('./routes/historialProductos');


// Sincronizar modelos y base de datos
(async () => {
    try {
        console.log('Iniciando sincronización de la base de datos...');
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida.');

        // Sincronización de modelos (actualizar estructura)
        await sequelize.sync(); 
        console.log('Modelos sincronizados correctamente.');

    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
})();




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
app.use('/api/detalle-visitas', detalleVisitasRouter);
app.use('/api/historial-productos', historialProductosRouter);

const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// const http = require('http').createServer(app);
// const io = require('socket.io')(http, {
//     cors: {
//         origin: "http://localhost:5173", 
//         methods: ["GET", "POST"]
//     }
// });

app.set('io', io);

// Listener
// http.listen(PORT, () => { // Cambia app.listen a http.listen
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });

module.exports = app;
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);