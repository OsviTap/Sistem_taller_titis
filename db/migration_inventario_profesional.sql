-- ========================================
-- MIGRACION: INVENTARIO PROFESIONAL (TIENDA / ALMACEN)
-- Sistema Taller Titis
-- ========================================
-- Objetivo:
-- 1) Separar stock por ubicacion (TIENDA, ALMACEN)
-- 2) Control por lotes con costo, margen y precio sugerido
-- 3) Kardex de movimientos
-- 4) Snapshot diario para corte por fecha

-- Tabla de ubicaciones
CREATE TABLE IF NOT EXISTS inventario_ubicaciones (
  id INT NOT NULL AUTO_INCREMENT,
  codigo ENUM('TIENDA','ALMACEN') NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  estado INT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_inventario_ubicaciones_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Asegurar ubicaciones base
INSERT INTO inventario_ubicaciones (codigo, nombre, descripcion, estado, createdAt, updatedAt)
SELECT 'TIENDA', 'Tienda', 'Stock disponible para venta inmediata', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventario_ubicaciones WHERE codigo = 'TIENDA');

INSERT INTO inventario_ubicaciones (codigo, nombre, descripcion, estado, createdAt, updatedAt)
SELECT 'ALMACEN', 'Almacen', 'Stock de respaldo y reposicion', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventario_ubicaciones WHERE codigo = 'ALMACEN');

-- Tabla de lotes de inventario
CREATE TABLE IF NOT EXISTS inventario_lotes (
  id INT NOT NULL AUTO_INCREMENT,
  productoId INT NOT NULL,
  ubicacionId INT NOT NULL,
  fechaIngreso DATE NOT NULL,
  documentoIngreso VARCHAR(255) NULL,
  proveedor VARCHAR(255) NULL,
  cantidadInicial INT NOT NULL,
  cantidadDisponible INT NOT NULL,
  costoUnitario DECIMAL(10,2) NOT NULL,
  porcentajeGanancia DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  precioVentaSugerido DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  observaciones TEXT NULL,
  estado INT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_lotes_producto_ubicacion (productoId, ubicacionId),
  INDEX idx_lotes_fecha (fechaIngreso),
  CONSTRAINT fk_lotes_producto
    FOREIGN KEY (productoId)
    REFERENCES Productos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_lotes_ubicacion
    FOREIGN KEY (ubicacionId)
    REFERENCES inventario_ubicaciones(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de movimientos de inventario (kardex)
CREATE TABLE IF NOT EXISTS inventario_movimientos (
  id INT NOT NULL AUTO_INCREMENT,
  fechaMovimiento DATETIME NOT NULL,
  tipoMovimiento ENUM('INGRESO','SALIDA_VENTA','TRASLADO_SALIDA','TRASLADO_ENTRADA','AJUSTE_POSITIVO','AJUSTE_NEGATIVO') NOT NULL,
  productoId INT NOT NULL,
  loteId INT NULL,
  ubicacionOrigenId INT NULL,
  ubicacionDestinoId INT NULL,
  cantidad INT NOT NULL,
  costoUnitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  precioUnitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  referenciaTipo VARCHAR(255) NULL,
  referenciaId INT NULL,
  usuarioResponsable VARCHAR(255) NULL,
  observaciones TEXT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_movimientos_producto_fecha (productoId, fechaMovimiento),
  INDEX idx_movimientos_lote (loteId),
  INDEX idx_movimientos_origen (ubicacionOrigenId),
  INDEX idx_movimientos_destino (ubicacionDestinoId),
  CONSTRAINT fk_mov_producto
    FOREIGN KEY (productoId)
    REFERENCES Productos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_mov_lote
    FOREIGN KEY (loteId)
    REFERENCES inventario_lotes(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_mov_ubicacion_origen
    FOREIGN KEY (ubicacionOrigenId)
    REFERENCES inventario_ubicaciones(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_mov_ubicacion_destino
    FOREIGN KEY (ubicacionDestinoId)
    REFERENCES inventario_ubicaciones(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Snapshot diario para cortes historicos
CREATE TABLE IF NOT EXISTS inventario_stock_diario (
  id INT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  productoId INT NOT NULL,
  ubicacionId INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  costoPromedio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  precioReferencia DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valorInventario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_stock_diario_fecha_producto_ubicacion (fecha, productoId, ubicacionId),
  INDEX idx_stock_diario_producto (productoId),
  INDEX idx_stock_diario_ubicacion (ubicacionId),
  CONSTRAINT fk_stock_diario_producto
    FOREIGN KEY (productoId)
    REFERENCES Productos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_stock_diario_ubicacion
    FOREIGN KEY (ubicacionId)
    REFERENCES inventario_ubicaciones(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Campos de control comercial en productos
SET @col_sku_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Productos'
    AND COLUMN_NAME = 'sku'
);
SET @sql_sku := IF(@col_sku_exists = 0,
  'ALTER TABLE Productos ADD COLUMN sku VARCHAR(80) NULL AFTER nombre',
  'SELECT 1'
);
PREPARE stmt_sku FROM @sql_sku;
EXECUTE stmt_sku;
DEALLOCATE PREPARE stmt_sku;

SET @col_stock_min_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Productos'
    AND COLUMN_NAME = 'stockMinimo'
);
SET @sql_stock_min := IF(@col_stock_min_exists = 0,
  'ALTER TABLE Productos ADD COLUMN stockMinimo INT NOT NULL DEFAULT 0 AFTER stock',
  'SELECT 1'
);
PREPARE stmt_stock_min FROM @sql_stock_min;
EXECUTE stmt_stock_min;
DEALLOCATE PREPARE stmt_stock_min;

SET @idx_sku_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Productos'
    AND INDEX_NAME = 'idx_productos_sku'
);
SET @sql_idx_sku := IF(@idx_sku_exists = 0,
  'CREATE INDEX idx_productos_sku ON Productos(sku)',
  'SELECT 1'
);
PREPARE stmt_idx_sku FROM @sql_idx_sku;
EXECUTE stmt_idx_sku;
DEALLOCATE PREPARE stmt_idx_sku;
