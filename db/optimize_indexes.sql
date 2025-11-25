-- ========================================
-- Script de Optimización de Índices
-- Sistema Taller Titis
-- ========================================
-- Este script agrega índices para optimizar las consultas más frecuentes

USE taller_titis;

-- ========================================
-- ÍNDICES PARA TABLA productos
-- ========================================
-- Optimiza búsquedas por nombre (usado en TablaProductos con search)
ALTER TABLE productos ADD INDEX idx_nombre (nombre);

-- Optimiza filtros de bajo stock (usado en TablaInfoProductos)
ALTER TABLE productos ADD INDEX idx_stock (stock);

-- Índice compuesto para ordenamiento por stock y nombre
ALTER TABLE productos ADD INDEX idx_stock_nombre (stock, nombre);


-- ========================================
-- ÍNDICES PARA TABLA product_history
-- ========================================
-- Optimiza queries de totales por fecha (usado en MenuDashboard)
ALTER TABLE product_history ADD INDEX idx_fechaSalida (fechaSalida);

-- Índice compuesto para agregaciones por fecha y producto
ALTER TABLE product_history ADD INDEX idx_fechaSalida_productoId (fechaSalida, productoId);


-- ========================================
-- ÍNDICES PARA TABLA visitas
-- ========================================
-- Optimiza búsquedas y ordenamiento por fecha (usado en HistorialView y TablaDashboard)
ALTER TABLE visitas ADD INDEX idx_fecha (fecha);

-- Índice para filtros por cliente
ALTER TABLE visitas ADD INDEX idx_clienteId (clienteId);

-- Índice para filtros por vehículo
ALTER TABLE visitas ADD INDEX idx_vehiculoId (vehiculoId);

-- Índice compuesto para queries complejas (fecha + cliente)
ALTER TABLE visitas ADD INDEX idx_fecha_clienteId (fecha, clienteId);


-- ========================================
-- ÍNDICES PARA TABLA vehiculos
-- ========================================
-- Optimiza búsquedas por placa (usado en búsqueda de HistorialView)
ALTER TABLE vehiculos ADD INDEX idx_placa (placa);

-- Optimiza filtros por estado (para separar activos de inactivos)
ALTER TABLE vehiculos ADD INDEX idx_estado (estado);

-- Índice compuesto cliente + estado (para obtener vehículos activos de un cliente)
ALTER TABLE vehiculos ADD INDEX idx_clienteId_estado (clienteId, estado);


-- ========================================
-- ÍNDICES PARA TABLA clientes
-- ========================================
-- Ya existe KEY `nombre` (`nombre`) en la definición original
-- Optimiza filtros por estado
ALTER TABLE clientes ADD INDEX idx_estado (estado);


-- ========================================
-- ÍNDICES PARA TABLA detalle_visitas
-- ========================================
-- Optimiza queries por tipo (Producto vs Servicio)
ALTER TABLE detalle_visitas ADD INDEX idx_tipo (tipo);

-- Índice compuesto para búsquedas por tipo y item
ALTER TABLE detalle_visitas ADD INDEX idx_tipo_itemId (tipo, itemId);


-- ========================================
-- VERIFICAR ÍNDICES CREADOS
-- ========================================
-- Descomentar para ver todos los índices de cada tabla

-- SHOW INDEX FROM productos;
-- SHOW INDEX FROM product_history;
-- SHOW INDEX FROM visitas;
-- SHOW INDEX FROM vehiculos;
-- SHOW INDEX FROM clientes;
-- SHOW INDEX FROM detalle_visitas;

-- ========================================
-- NOTAS DE OPTIMIZACIÓN
-- ========================================
/*
1. Los índices mejoran significativamente las búsquedas (WHERE, JOIN) y ordenamientos (ORDER BY)
2. Los índices compuestos son más eficientes para queries que filtran por múltiples columnas
3. El orden de las columnas en índices compuestos importa:
   - Primera columna debe ser la más selectiva o la más usada en WHERE
4. Índices tienen un costo en espacio y en operaciones de INSERT/UPDATE/DELETE
5. Para tablas pequeñas (<1000 registros), los índices tienen impacto mínimo

IMPACTO ESPERADO:
- Búsquedas por nombre: 70-90% más rápido
- Filtros de bajo stock: 80-95% más rápido
- Agregaciones de fechas: 60-80% más rápido
- Queries del dashboard: 50-70% más rápido
- Historial de visitas con filtros: 60-85% más rápido
*/
