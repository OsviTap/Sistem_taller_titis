# Plan Maestro - Inventario Profesional Taller Titis

## 1) Diagnostico actual (estado real del sistema)

### 1.1 Lo que existe hoy
- Existe un catalogo de productos con campos basicos: nombre, stock global, precioCosto, precioVenta, fechaAdquisicion.
- El stock es unico por producto (no distingue Tienda vs Almacen).
- La salida de stock se descuenta en ventas diarias y visitas, pero sin trazabilidad por lote/costo de ingreso.
- El historial de productos guarda ventas con precioCosto/precioVenta/ganancia, pero no conserva origen por ubicacion ni lote.
- No hay kardex formal de movimientos de inventario.
- No existe corte historico de stock por fecha (snapshot diario o reconstruccion robusta).

### 1.2 Riesgos del estado actual
- Riesgo de desabastecimiento en Tienda aunque exista stock en Almacen (o viceversa) por falta de separacion fisica.
- Margenes historicos pueden distorsionarse cuando cambia costo de compra en contextos de alta volatilidad de precios.
- No hay trazabilidad fina para auditoria: que lote ingreso, con que costo, con que margen y donde termino.
- Dificultad para decisiones comerciales (precio objetivo, reposicion, rentabilidad real por periodo).

## 2) Vision objetivo
Implementar un sistema de inventario profesional con:
- Doble ubicacion operativa: TIENDA y ALMACEN.
- Control por lotes de ingreso: fecha, costo unitario, porcentaje de ganancia, precio sugerido.
- Kardex de movimientos: ingreso, salida por venta, traslado, ajustes.
- Stock historico por fecha (y valorizacion) para reportes gerenciales.
- Integracion con ventas/visitas para que el flujo sea automatico.

## 3) Fases de implementacion

## Fase 0 - Fundacion de datos (estructura)
Objetivo: crear la base tecnica sin romper operacion actual.
Entregables:
- Tablas: inventario_ubicaciones, inventario_lotes, inventario_movimientos, inventario_stock_diario.
- Campos de control comercial en productos: sku, stockMinimo.
- API base para ubicaciones, ingresos, traslados, resumen, kardex y stock historico.
Criterio de cierre:
- Se puede registrar un ingreso con costo+margen en una ubicacion.
- Se puede trasladar stock entre ubicaciones.
- Se puede consultar kardex y stock historico por fecha.

## Fase 1 - Operacion de entradas profesional
Objetivo: registrar compras/entradas de forma contable y comercial.
Entregables:
- Flujo UI de "Ingreso de inventario" con:
  - Producto
  - Ubicacion
  - Fecha ingreso
  - Cantidad
  - Costo unitario
  - % ganancia
  - Precio sugerido autocalculado
  - Documento/proveedor/observaciones
- Reglas de validacion (cantidades, costos, margen, permisos).
Criterio de cierre:
- Toda entrada nueva queda registrada por lote con trazabilidad completa.

## Fase 2 - Integracion con ventas y visitas
Objetivo: que la salida de inventario sea exacta por ubicacion/lote.
Entregables:
- Politica de salida (FIFO recomendado) desde TIENDA.
- Si TIENDA no alcanza, opcion controlada de traslado automatico desde ALMACEN o bloqueo con alerta.
- Registro de movimiento SALIDA_VENTA por cada item vendido.
Criterio de cierre:
- Cada venta/visita impacta lotes y kardex de forma consistente.

## Fase 3 - Stock historico y valorizacion
Objetivo: responder "que stock y valor tenia en fecha X".
Entregables:
- Endpoint de stock historico por fecha (resumen + detalle por lote).
- Snapshot diario (cierre diario) para aceleracion de reportes.
- Valorizacion de inventario por ubicacion y total.
Criterio de cierre:
- Reporte historico consistente en pruebas de corte mensual.

## Fase 4 - Reportes gerenciales y rentabilidad
Objetivo: convertir datos en decisiones de negocio.
Entregables:
- Reporte de rentabilidad por lote, producto, periodo, ubicacion.
- Alertas: stock minimo, margen por debajo del objetivo, rotacion lenta.
- Analisis de volatilidad: variacion de costo entre lotes y su impacto en precio sugerido.
Criterio de cierre:
- Dashboard operativo para decisiones de compra, precio y reposicion.

## Fase 5 - Gobierno, control interno y escalamiento
Objetivo: robustecer para crecimiento.
Entregables:
- Roles y permisos en operaciones sensibles (ajustes, traslados, cierres).
- Bitacora de auditoria de acciones criticas.
- Procedimiento de cierre diario/semanal/mensual.
Criterio de cierre:
- Trazabilidad de punta a punta y controles operativos estables.

## 4) Estandares funcionales recomendados para este negocio
- Politica de salida: FIFO para estabilidad de costo y control de margen.
- Politica de precio: costo + % margen objetivo por lote, con tolerancias por mercado.
- Stock minimo por producto y reposicion sugerida automatica.
- Cierre diario de inventario y caja para consistencia contable-operativa.
- Indicadores clave:
  - Rotacion por producto
  - Margen bruto por linea
  - Quiebres de stock
  - Valor de inventario inmovilizado

## 5) Implementado en esta etapa (inicio real)
- Base de modelos backend para inventario profesional.
- API inicial de inventario (ubicaciones, ingresos, traslados, kardex, stock historico, snapshot diario).
- Migracion SQL de estructura profesional.

## 6) Bitacora por fase
La bitacora operativa se mantiene en:
- BITACORA_IMPLEMENTACION_INVENTARIO.md
