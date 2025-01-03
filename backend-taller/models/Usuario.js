const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
    nombre: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    rol: { 
        type: DataTypes.ENUM('administrador', 'empleado'), 
        defaultValue: 'empleado' 
    },
}, { 
    tableName: 'usuarios', 
    timestamps: true,
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.password) {
                usuario.password = await bcrypt.hash(usuario.password, 10);
            }
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('password')) {
                usuario.password = await bcrypt.hash(usuario.password, 10);
            }
        }
    }
});

Usuario.prototype.validarPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;
