-- ========================================
-- MIGRACION: VENTAS Y GASTOS DIARIOS
-- Sistema Taller Titis
-- ========================================
-- Crea tablas para ventas directas de productos y gastos operativos diarios.

-- USE taller_titis;
-- (Comentado para usar la base de datos activa)

CREATE TABLE IF NOT EXISTS ventas_diarias (
  id INT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  numeroVenta VARCHAR(255) NULL,
  clienteNombre VARCHAR(255) NULL,
  metodoPago ENUM('Efectivo','Tarjeta','Transferencia','QR','Mixto') NOT NULL DEFAULT 'Efectivo',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  observaciones TEXT NULL,
  estado INT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_ventas_diarias_fecha (fecha),
  INDEX idx_ventas_diarias_estado_fecha (estado, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS detalle_ventas_diarias (
  id INT NOT NULL AUTO_INCREMENT,
  ventaDiariaId INT NOT NULL,
  productoId INT NULL,
  nombreProducto VARCHAR(255) NOT NULL,
  precioUnitario DECIMAL(10,2) NOT NULL,
  costoUnitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cantidad INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  ganancia DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_detalle_venta_diaria_venta (ventaDiariaId),
  INDEX idx_detalle_venta_diaria_producto (productoId),
  CONSTRAINT fk_detalle_venta_diaria_venta
    FOREIGN KEY (ventaDiariaId)
    REFERENCES ventas_diarias(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_venta_diaria_producto
    FOREIGN KEY (productoId)
    REFERENCES Productos(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS gastos_diarios (
  id INT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodoPago ENUM('Efectivo','Tarjeta','Transferencia','QR','Mixto') NOT NULL DEFAULT 'Efectivo',
  comprobante VARCHAR(255) NULL,
  observaciones TEXT NULL,
  estado INT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_gastos_diarios_fecha (fecha),
  INDEX idx_gastos_diarios_estado_fecha (estado, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS planillas_registros (
  id INT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  tipoPlanilla ENUM('TIENDA','SUELDOS_SERVICIOS') NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodoPago ENUM('Efectivo','Tarjeta','Transferencia','QR','Mixto') NOT NULL DEFAULT 'Efectivo',
  observaciones TEXT NULL,
  estado INT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_planillas_fecha_tipo (fecha, tipoPlanilla),
  INDEX idx_planillas_estado_fecha (estado, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS caja_turnos (
  id INT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  turno ENUM('Manana','Tarde','Noche') NOT NULL,
  responsable VARCHAR(255) NULL,
  saldoInicial DECIMAL(10,2) NOT NULL,
  fechaApertura DATETIME NOT NULL,
  fechaCierre DATETIME NULL,
  ventasEfectivo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ingresosExtra DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  gastosEfectivo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  saldoTeorico DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  saldoArqueo DECIMAL(10,2) NULL,
  diferencia DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estado ENUM('ABIERTO','CERRADO') NOT NULL DEFAULT 'ABIERTO',
  observaciones TEXT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_caja_turnos_fecha_turno (fecha, turno),
  INDEX idx_caja_turnos_estado_fecha (estado, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
