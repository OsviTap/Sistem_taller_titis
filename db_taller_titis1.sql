-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.30 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para taller_titis
CREATE DATABASE IF NOT EXISTS `taller_titis` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `taller_titis`;

-- Volcando estructura para tabla taller_titis.caja_chica
CREATE TABLE IF NOT EXISTS `caja_chica` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fechaApertura` datetime NOT NULL,
  `fechaCierre` datetime DEFAULT NULL,
  `saldoInicial` decimal(10,2) NOT NULL,
  `saldoFinal` decimal(10,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `usuarioId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuarioId` (`usuarioId`),
  CONSTRAINT `caja_chica_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nit` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` int NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.detalle_visitas
CREATE TABLE IF NOT EXISTS `detalle_visitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visitaId` int DEFAULT NULL,
  `tipo` enum('Servicio','Producto') COLLATE utf8mb4_general_ci NOT NULL,
  `itemId` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `subtotal` decimal(10,2) NOT NULL,
  `estado` int DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visitaId` (`visitaId`),
  CONSTRAINT `detalle_visitas_ibfk_1` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.historial_visitas
CREATE TABLE IF NOT EXISTS `historial_visitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `clienteId` int DEFAULT NULL,
  `vehiculoId` int DEFAULT NULL,
  `visitaId` int DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `kilometraje` int NOT NULL,
  `proximoCambio` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `tipoPago` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `clienteId` (`clienteId`),
  KEY `vehiculoId` (`vehiculoId`),
  KEY `visitaId` (`visitaId`),
  CONSTRAINT `historial_visitas_ibfk_144` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_147` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_150` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_153` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_156` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_159` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_160` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_161` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `historial_visitas_ibfk_162` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.marcas
CREATE TABLE IF NOT EXISTS `marcas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_2` (`nombre`),
  KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.modelos
CREATE TABLE IF NOT EXISTS `modelos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `marcaId` int NOT NULL DEFAULT '0',
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nombre` (`nombre`),
  KEY `marcaId` (`marcaId`),
  CONSTRAINT `modelos_ibfk_1` FOREIGN KEY (`marcaId`) REFERENCES `marcas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `stock` int NOT NULL,
  `precioCosto` float NOT NULL,
  `precioVenta` float NOT NULL,
  `fechaAdquisicion` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.product_history
CREATE TABLE IF NOT EXISTS `product_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fechaSalida` datetime NOT NULL,
  `cantidad` int NOT NULL,
  `precioCosto` decimal(10,2) NOT NULL,
  `precioVenta` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  `ganancia` decimal(10,2) NOT NULL,
  `productoId` int NOT NULL,
  `clienteId` int NOT NULL,
  `vehiculoId` int NOT NULL,
  `visitaId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productoId` (`productoId`),
  KEY `clienteId` (`clienteId`),
  KEY `vehiculoId` (`vehiculoId`),
  KEY `visitaId` (`visitaId`),
  CONSTRAINT `product_history_ibfk_1` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_10` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_11` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_12` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_13` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_14` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_15` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_16` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_17` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_18` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_19` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_2` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_20` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_21` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_22` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_23` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_24` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_25` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_26` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_27` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_28` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_29` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_3` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_30` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_31` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_32` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_33` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_34` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_35` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_36` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_37` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_38` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_39` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_4` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_40` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_41` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_42` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_43` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_44` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_45` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_46` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_47` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_48` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_5` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_6` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_7` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_8` FOREIGN KEY (`visitaId`) REFERENCES `visitas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_history_ibfk_9` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.servicios
CREATE TABLE IF NOT EXISTS `servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `precio` float NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rol` enum('administrador','empleado') COLLATE utf8mb4_general_ci DEFAULT 'empleado',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.vehiculos
CREATE TABLE IF NOT EXISTS `vehiculos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clienteId` int DEFAULT NULL,
  `marcaId` int DEFAULT '0',
  `modeloId` int DEFAULT '0',
  `placa` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `estado` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `marca_id` (`marcaId`) USING BTREE,
  KEY `modelo_id` (`modeloId`) USING BTREE,
  KEY `clienteId` (`clienteId`),
  CONSTRAINT `vehiculos_ibfk_154` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vehiculos_ibfk_155` FOREIGN KEY (`marcaId`) REFERENCES `marcas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehiculos_ibfk_156` FOREIGN KEY (`modeloId`) REFERENCES `modelos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla taller_titis.visitas
CREATE TABLE IF NOT EXISTS `visitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clienteId` int NOT NULL,
  `vehiculoId` int NOT NULL,
  `fecha` datetime NOT NULL,
  `kilometraje` int NOT NULL,
  `proximoCambio` int NOT NULL,
  `tipoPago` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Efectivo',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `clienteId` (`clienteId`),
  KEY `vehiculoId` (`vehiculoId`),
  CONSTRAINT `visitas_ibfk_75` FOREIGN KEY (`clienteId`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `visitas_ibfk_76` FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
