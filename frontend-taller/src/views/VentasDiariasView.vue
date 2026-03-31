<template>
  <div class="py-6 sm:py-8 px-3 sm:px-4 mx-auto max-w-screen-2xl lg:px-6">
    <div class="relative bg-white dark:bg-gray-800 sm:rounded-lg overflow-hidden shadow-sm">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Gestión Diaria</h2>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Ventas directas, planillas, gastos, caja por turnos y reporte ejecutivo.
          </div>
        </div>
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button @click="activeTab = 'ventas'" :class="tabClass('ventas')">Ventas Directas</button>
          <button @click="activeTab = 'gastos'" :class="tabClass('gastos')">Gastos Diarios</button>
          <button @click="activeTab = 'planillas'" :class="tabClass('planillas')">Planillas</button>
          <button @click="activeTab = 'caja'" :class="tabClass('caja')">Caja por Turnos</button>
          <button @click="activeTab = 'historial'" :class="tabClass('historial')">Historial Diario</button>
          <button @click="activeTab = 'reporte'" :class="tabClass('reporte')">Reporte Mensual</button>
        </div>
      </div>

      <div v-if="activeTab === 'ventas'" class="p-4 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="field-label">Fecha</label>
            <input v-model="ventaForm.fecha" type="date" class="input-field" />
          </div>
          <div>
            <label class="field-label">Nro. Venta</label>
            <input v-model="ventaForm.numeroVenta" type="text" class="input-field" placeholder="VD-20260331-001" />
          </div>
          <div>
            <label class="field-label">Cliente (Opcional)</label>
            <input v-model="ventaForm.clienteNombre" type="text" class="input-field" placeholder="Cliente de mostrador" />
          </div>
          <div>
            <label class="field-label">Método de Pago</label>
            <select v-model="ventaForm.metodoPago" class="input-field">
              <option v-for="metodo in metodosPago" :key="metodo" :value="metodo">{{ metodo }}</option>
            </select>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Agregar productos</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              v-model="productoSearch"
              @keyup.enter="buscarProductos"
              type="text"
              class="input-field md:col-span-2"
              placeholder="Buscar por nombre o ID"
            />
            <button @click="buscarProductos" class="btn-primary w-full">Buscar</button>
            <select v-model="cantidadSeleccionada" class="input-field">
              <option v-for="q in 20" :key="q" :value="q">{{ q }} unidad(es)</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2" v-if="productosEncontrados.length">
            <button
              v-for="producto in productosEncontrados"
              :key="producto.id"
              @click="agregarProducto(producto)"
              class="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800"
            >
              <p class="font-medium text-gray-900 dark:text-white">{{ producto.nombre }}</p>
              <p class="text-xs text-gray-500">Stock: {{ producto.stock }} | Venta: Bs {{ Number(producto.precioVenta).toFixed(2) }}</p>
            </button>
          </div>
          <p v-else class="text-sm text-gray-500">Realiza una búsqueda para agregar productos a la venta.</p>
        </div>

        <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table class="w-full min-w-[680px] text-sm text-left text-gray-600 dark:text-gray-300">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-2">Producto</th>
                <th class="px-4 py-2">Cantidad</th>
                <th class="px-4 py-2">Precio Unit.</th>
                <th class="px-4 py-2">Subtotal</th>
                <th class="px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detalleVenta" :key="item.productoId" class="border-t border-gray-200 dark:border-gray-700">
                <td class="px-4 py-2">{{ item.nombreProducto }}</td>
                <td class="px-4 py-2">{{ item.cantidad }}</td>
                <td class="px-4 py-2">Bs {{ Number(item.precioUnitario).toFixed(2) }}</td>
                <td class="px-4 py-2">Bs {{ Number(item.subtotal).toFixed(2) }}</td>
                <td class="px-4 py-2">
                  <button @click="quitarProducto(item.productoId)" class="text-red-600 hover:text-red-800">Quitar</button>
                </td>
              </tr>
              <tr v-if="detalleVenta.length === 0">
                <td colspan="5" class="px-4 py-4 text-center text-gray-500">Sin productos en la venta</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="field-label">Descuento (Bs)</label>
            <input v-model.number="ventaForm.descuento" type="number" min="0" step="0.01" class="input-field" />
          </div>
          <div class="md:col-span-2">
            <label class="field-label">Observaciones</label>
            <input v-model="ventaForm.observaciones" type="text" class="input-field" placeholder="Notas de la venta" />
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p class="text-sm text-gray-500">Subtotal: <span class="font-semibold text-gray-800 dark:text-white">Bs {{ subtotalVenta.toFixed(2) }}</span></p>
            <p class="text-sm text-gray-500">Total: <span class="font-semibold text-green-700">Bs {{ totalVenta.toFixed(2) }}</span></p>
          </div>
          <button @click="guardarVenta" class="btn-primary w-full md:w-auto">Guardar Venta Directa</button>
        </div>
      </div>

      <div v-if="activeTab === 'gastos'" class="p-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="field-label">Fecha</label>
            <input v-model="gastoForm.fecha" type="date" class="input-field" />
          </div>
          <div>
            <label class="field-label">Categoría</label>
            <select v-model="gastoForm.categoria" class="input-field">
              <option v-for="categoria in categoriasGasto" :key="categoria" :value="categoria">{{ categoria }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Método de Pago</label>
            <select v-model="gastoForm.metodoPago" class="input-field">
              <option v-for="metodo in metodosPago" :key="metodo" :value="metodo">{{ metodo }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="field-label">Descripción</label>
            <input v-model="gastoForm.descripcion" type="text" class="input-field" placeholder="Ej: Compra de filtros" />
          </div>
          <div>
            <label class="field-label">Monto (Bs)</label>
            <input v-model.number="gastoForm.monto" type="number" min="0" step="0.01" class="input-field" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="field-label">Comprobante</label>
            <input v-model="gastoForm.comprobante" type="text" class="input-field" placeholder="Nro. factura/recibo" />
          </div>
          <div>
            <label class="field-label">Observaciones</label>
            <input v-model="gastoForm.observaciones" type="text" class="input-field" placeholder="Notas del gasto" />
          </div>
        </div>

        <div class="flex justify-end">
          <button @click="guardarGasto" class="btn-warning w-full md:w-auto">Guardar Gasto</button>
        </div>
      </div>

      <div v-if="activeTab === 'planillas'" class="p-4 space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            @click="planillaForm.tipoPlanilla = 'TIENDA'"
            :class="pillClass(planillaForm.tipoPlanilla === 'TIENDA')"
          >
            Planilla Tienda (silicona, agua acidulada, etc.)
          </button>
          <button
            @click="planillaForm.tipoPlanilla = 'SUELDOS_SERVICIOS'"
            :class="pillClass(planillaForm.tipoPlanilla === 'SUELDOS_SERVICIOS')"
          >
            Planilla Sueldos y Servicios Básicos
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="field-label">Fecha</label>
            <input v-model="planillaForm.fecha" type="date" class="input-field" />
          </div>
          <div>
            <label class="field-label">Categoría</label>
            <select v-model="planillaForm.categoria" class="input-field">
              <option v-for="categoria in categoriasPlanillaActual" :key="categoria" :value="categoria">{{ categoria }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">Método de Pago</label>
            <select v-model="planillaForm.metodoPago" class="input-field">
              <option v-for="metodo in metodosPago" :key="metodo" :value="metodo">{{ metodo }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <label class="field-label">Concepto</label>
            <input v-model="planillaForm.concepto" type="text" class="input-field" placeholder="Ej: Compra de silicona / Sueldo técnico" />
          </div>
          <div>
            <label class="field-label">Monto (Bs)</label>
            <input v-model.number="planillaForm.monto" type="number" min="0" step="0.01" class="input-field" />
          </div>
        </div>

        <div>
          <label class="field-label">Observaciones</label>
          <input v-model="planillaForm.observaciones" type="text" class="input-field" placeholder="Detalle extra para auditoría" />
        </div>

        <div class="flex justify-end">
          <button @click="guardarPlanilla" class="btn-primary w-full md:w-auto">Guardar en Planillas</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="panel-table">
            <div class="panel-title">Planilla Tienda</div>
            <div class="table-wrapper">
              <table class="table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in planillasTienda" :key="item.id">
                    <td>{{ item.fecha }}</td>
                    <td>{{ item.categoria }}</td>
                    <td>{{ item.concepto }}</td>
                    <td>Bs {{ Number(item.monto).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="planillasTienda.length === 0"><td colspan="4" class="empty-row">Sin registros</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel-table">
            <div class="panel-title">Planilla Sueldos y Servicios</div>
            <div class="table-wrapper">
              <table class="table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in planillasSueldosServicios" :key="item.id">
                    <td>{{ item.fecha }}</td>
                    <td>{{ item.categoria }}</td>
                    <td>{{ item.concepto }}</td>
                    <td>Bs {{ Number(item.monto).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="planillasSueldosServicios.length === 0"><td colspan="4" class="empty-row">Sin registros</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'caja'" class="p-4 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Apertura de Turno</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="field-label">Fecha</label>
                <input v-model="cajaAperturaForm.fecha" type="date" class="input-field" />
              </div>
              <div>
                <label class="field-label">Turno</label>
                <select v-model="cajaAperturaForm.turno" class="input-field">
                  <option value="Manana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="field-label">Responsable</label>
                <input v-model="cajaAperturaForm.responsable" type="text" class="input-field" placeholder="Nombre del encargado" />
              </div>
              <div>
                <label class="field-label">Saldo Inicial</label>
                <input v-model.number="cajaAperturaForm.saldoInicial" type="number" min="0" step="0.01" class="input-field" />
              </div>
            </div>
            <div>
              <label class="field-label">Observaciones</label>
              <input v-model="cajaAperturaForm.observaciones" type="text" class="input-field" placeholder="Notas de apertura" />
            </div>
            <button @click="abrirTurnoCaja" class="btn-primary w-full md:w-auto">Abrir Turno</button>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Cierre con Arqueo</h3>
            <div>
              <label class="field-label">Turno Abierto</label>
              <select v-model="cajaCierreForm.turnoId" class="input-field">
                <option value="">Seleccione un turno</option>
                <option v-for="turno in cajaTurnosAbiertos" :key="turno.id" :value="turno.id">
                  {{ turno.fecha }} - {{ turno.turno }} - {{ turno.responsable || 'Sin responsable' }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="field-label">Saldo Arqueado</label>
                <input v-model.number="cajaCierreForm.saldoArqueo" type="number" min="0" step="0.01" class="input-field" />
              </div>
              <div>
                <label class="field-label">Ingresos Extra</label>
                <input v-model.number="cajaCierreForm.ingresosExtra" type="number" min="0" step="0.01" class="input-field" />
              </div>
            </div>
            <div>
              <label class="field-label">Observaciones</label>
              <input v-model="cajaCierreForm.observaciones" type="text" class="input-field" placeholder="Notas de cierre / diferencias" />
            </div>
            <button @click="cerrarTurnoCaja" class="btn-warning w-full md:w-auto">Cerrar Turno</button>
          </div>
        </div>

        <div class="panel-table">
          <div class="panel-title">Historial de Caja por Turnos</div>
          <div class="table-wrapper">
            <table class="table-sm">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Inicial</th>
                  <th>Teórico</th>
                  <th>Arqueo</th>
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="turno in cajaTurnos" :key="turno.id">
                  <td>{{ turno.fecha }}</td>
                  <td>{{ turno.turno }}</td>
                  <td>{{ turno.responsable || '-' }}</td>
                  <td>{{ turno.estado }}</td>
                  <td>Bs {{ Number(turno.saldoInicial || 0).toFixed(2) }}</td>
                  <td>Bs {{ Number(turno.saldoTeorico || 0).toFixed(2) }}</td>
                  <td>Bs {{ Number(turno.saldoArqueo || 0).toFixed(2) }}</td>
                  <td :class="Number(turno.diferencia || 0) >= 0 ? 'text-blue-700' : 'text-red-700'">
                    Bs {{ Number(turno.diferencia || 0).toFixed(2) }}
                  </td>
                </tr>
                <tr v-if="cajaTurnos.length === 0"><td colspan="8" class="empty-row">Sin movimientos de caja</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'historial'" class="p-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label class="field-label">Desde</label>
            <input v-model="filtro.fechaInicio" type="date" class="input-field" />
          </div>
          <div>
            <label class="field-label">Hasta</label>
            <input v-model="filtro.fechaFin" type="date" class="input-field" />
          </div>
          <div>
            <button @click="cargarHistorial" class="btn-primary w-full">Actualizar</button>
          </div>
          <div>
            <button @click="exportarExcelDiario" class="btn-success w-full">Excel Diario</button>
          </div>
          <div>
            <button @click="exportarCSVDiario" class="btn-light w-full">CSV Google Sheets</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div class="summary-card">
            <p class="summary-label">Total Ventas</p>
            <p class="summary-value text-green-700">Bs {{ Number(resumen.totalVentas || 0).toFixed(2) }}</p>
          </div>
          <div class="summary-card">
            <p class="summary-label">Gastos Operativos</p>
            <p class="summary-value text-red-600">Bs {{ Number(resumen.totalGastosOperativos || 0).toFixed(2) }}</p>
          </div>
          <div class="summary-card">
            <p class="summary-label">Planillas</p>
            <p class="summary-value text-amber-600">Bs {{ Number(resumen.totalPlanillas || 0).toFixed(2) }}</p>
          </div>
          <div class="summary-card">
            <p class="summary-label">Utilidad Neta</p>
            <p class="summary-value" :class="Number(resumen.utilidadNeta || 0) >= 0 ? 'text-blue-700' : 'text-red-700'">
              Bs {{ Number(resumen.utilidadNeta || 0).toFixed(2) }}
            </p>
          </div>
          <div class="summary-card">
            <p class="summary-label">Productos Vendidos</p>
            <p class="summary-value text-indigo-700">{{ Number(resumen.totalProductosVendidos || 0) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="panel-table">
            <div class="panel-title">Ventas</div>
            <div class="table-wrapper">
              <table class="table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="venta in ventas" :key="venta.id">
                    <td>{{ venta.fecha }}</td>
                    <td>{{ venta.clienteNombre || 'Mostrador' }}</td>
                    <td>Bs {{ Number(venta.total).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="ventas.length === 0"><td colspan="3" class="empty-row">Sin ventas</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel-table">
            <div class="panel-title">Gastos</div>
            <div class="table-wrapper">
              <table class="table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="gasto in gastos" :key="gasto.id">
                    <td>{{ gasto.fecha }}</td>
                    <td>{{ gasto.categoria }}</td>
                    <td>Bs {{ Number(gasto.monto).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="gastos.length === 0"><td colspan="3" class="empty-row">Sin gastos</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel-table">
            <div class="panel-title">Planillas</div>
            <div class="table-wrapper">
              <table class="table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="planilla in planillas" :key="planilla.id">
                    <td>{{ planilla.fecha }}</td>
                    <td>{{ planilla.tipoPlanilla }}</td>
                    <td>Bs {{ Number(planilla.monto).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="planillas.length === 0"><td colspan="3" class="empty-row">Sin planillas</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'reporte'" class="p-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label class="field-label">Año</label>
            <input v-model.number="reporteFiltro.year" type="number" min="2020" class="input-field" />
          </div>
          <div>
            <label class="field-label">Mes</label>
            <select v-model.number="reporteFiltro.month" class="input-field">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div>
            <button @click="cargarReporteMensual" class="btn-primary w-full">Generar</button>
          </div>
          <div>
            <button @click="exportarExcelReporteMensual" class="btn-success w-full">Excel Multihoja</button>
          </div>
        </div>

        <div class="summary-card">
          <p class="text-sm text-gray-600">Periodo: {{ reporteMensual.periodo?.startDate || '-' }} a {{ reporteMensual.periodo?.endDate || '-' }}</p>
          <p class="text-sm text-gray-600">Utilidad Neta: <span class="font-semibold">Bs {{ Number(reporteMensual.resumen?.utilidadNeta || 0).toFixed(2) }}</span></p>
        </div>

        <div class="panel-table">
          <div class="panel-title">Top Productos del Mes</div>
          <div class="table-wrapper">
            <table class="table-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Monto</th>
                  <th>Ganancia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in reporteMensual.topProductos || []" :key="item.nombreProducto">
                  <td>{{ item.nombreProducto }}</td>
                  <td>{{ Number(item.cantidadTotal || 0) }}</td>
                  <td>Bs {{ Number(item.montoTotal || 0).toFixed(2) }}</td>
                  <td>Bs {{ Number(item.gananciaTotal || 0).toFixed(2) }}</td>
                </tr>
                <tr v-if="!(reporteMensual.topProductos || []).length"><td colspan="4" class="empty-row">Sin datos de productos</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Sincronización Opcional Google Sheets</h3>
          <p class="text-xs text-gray-500">Puedes dejar vacío el spreadsheetId si ya tienes definido GOOGLE_SHEETS_SPREADSHEET_ID en backend.</p>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input v-model="googleSheetsForm.spreadsheetId" type="text" class="input-field md:col-span-3" placeholder="Spreadsheet ID (opcional)" />
            <button @click="sincronizarGoogleSheets" class="btn-warning w-full">Sincronizar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import axios from '@/api/axios';

const activeTab = ref('ventas');
const metodosPago = ['Efectivo', 'Tarjeta', 'Transferencia', 'QR', 'Mixto'];
const categoriasGasto = ['Compra de insumos', 'Servicios básicos', 'Alquiler', 'Sueldos', 'Transporte', 'Mantenimiento', 'Otros'];

const categoriasPlanillaTienda = ['Silicona', 'Agua acidulada', 'Limpieza', 'Insumos mecánicos', 'Otros tienda'];
const categoriasPlanillaSueldos = ['Pago sueldos', 'Agua', 'Luz', 'Internet', 'Telefonía', 'Impuestos', 'Otros servicios'];

const now = new Date();
const today = now.toISOString().split('T')[0];

const ventaForm = ref({
  fecha: today,
  numeroVenta: '',
  clienteNombre: '',
  metodoPago: 'Efectivo',
  descuento: 0,
  observaciones: '',
});

const gastoForm = ref({
  fecha: today,
  categoria: 'Compra de insumos',
  descripcion: '',
  monto: 0,
  metodoPago: 'Efectivo',
  comprobante: '',
  observaciones: '',
});

const planillaForm = ref({
  fecha: today,
  tipoPlanilla: 'TIENDA',
  categoria: 'Silicona',
  concepto: '',
  monto: 0,
  metodoPago: 'Efectivo',
  observaciones: '',
});

const cajaAperturaForm = ref({
  fecha: today,
  turno: 'Manana',
  responsable: '',
  saldoInicial: 0,
  observaciones: '',
});

const cajaCierreForm = ref({
  turnoId: '',
  saldoArqueo: 0,
  ingresosExtra: 0,
  observaciones: '',
});

const filtro = ref({
  fechaInicio: today,
  fechaFin: today,
});

const reporteFiltro = ref({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
});

const googleSheetsForm = ref({
  spreadsheetId: '',
});

const productoSearch = ref('');
const cantidadSeleccionada = ref(1);
const productosEncontrados = ref([]);
const detalleVenta = ref([]);

const ventas = ref([]);
const gastos = ref([]);
const planillas = ref([]);
const resumen = ref({});
const cajaTurnos = ref([]);

const reporteMensual = ref({
  periodo: null,
  resumen: {},
  ventas: [],
  gastos: [],
  planillas: [],
  cajaTurnos: [],
  topProductos: [],
});

const categoriasPlanillaActual = computed(() => (
  planillaForm.value.tipoPlanilla === 'TIENDA'
    ? categoriasPlanillaTienda
    : categoriasPlanillaSueldos
));

watch(
  () => planillaForm.value.tipoPlanilla,
  (tipo) => {
    planillaForm.value.categoria = tipo === 'TIENDA' ? categoriasPlanillaTienda[0] : categoriasPlanillaSueldos[0];
  }
);

const planillasTienda = computed(() => planillas.value.filter((p) => p.tipoPlanilla === 'TIENDA'));
const planillasSueldosServicios = computed(() => planillas.value.filter((p) => p.tipoPlanilla === 'SUELDOS_SERVICIOS'));

const cajaTurnosAbiertos = computed(() => cajaTurnos.value.filter((c) => c.estado === 'ABIERTO'));

const subtotalVenta = computed(() => detalleVenta.value.reduce((acc, item) => acc + Number(item.subtotal), 0));
const totalVenta = computed(() => Math.max(subtotalVenta.value - Number(ventaForm.value.descuento || 0), 0));

const tabClass = (tab) => [
  'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0',
  activeTab.value === tab
    ? 'bg-blue-700 text-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200',
];

const pillClass = (active) => [
  'px-3 py-2 rounded-full text-xs font-semibold transition-colors',
  active ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700',
];

const buscarProductos = async () => {
  try {
    const response = await axios.get('/productos', {
      params: {
        page: 1,
        limit: 30,
        search: productoSearch.value,
      },
    });
    productosEncontrados.value = response.data.data || [];
  } catch (error) {
    console.error('Error al buscar productos', error);
    Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
  }
};

const agregarProducto = (producto) => {
  const cantidad = Number(cantidadSeleccionada.value || 1);
  if (cantidad <= 0) {
    Swal.fire('Atención', 'La cantidad debe ser mayor a cero.', 'warning');
    return;
  }

  const existente = detalleVenta.value.find((item) => item.productoId === producto.id);
  const nuevaCantidad = (existente?.cantidad || 0) + cantidad;

  if (nuevaCantidad > Number(producto.stock)) {
    Swal.fire('Stock insuficiente', `Disponible para ${producto.nombre}: ${producto.stock}`, 'warning');
    return;
  }

  if (existente) {
    existente.cantidad = nuevaCantidad;
    existente.subtotal = existente.cantidad * Number(existente.precioUnitario);
  } else {
    detalleVenta.value.push({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidad,
      precioUnitario: Number(producto.precioVenta),
      subtotal: cantidad * Number(producto.precioVenta),
    });
  }
};

const quitarProducto = (productoId) => {
  detalleVenta.value = detalleVenta.value.filter((item) => item.productoId !== productoId);
};

const resetVenta = () => {
  ventaForm.value = {
    fecha: today,
    numeroVenta: '',
    clienteNombre: '',
    metodoPago: 'Efectivo',
    descuento: 0,
    observaciones: '',
  };
  detalleVenta.value = [];
  cantidadSeleccionada.value = 1;
};

const guardarVenta = async () => {
  if (!detalleVenta.value.length) {
    Swal.fire('Atención', 'Debe agregar al menos un producto.', 'warning');
    return;
  }

  try {
    await axios.post('/ventas-diarias/ventas', {
      ...ventaForm.value,
      items: detalleVenta.value.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      })),
    });

    Swal.fire('Venta registrada', 'La venta diaria se registró correctamente.', 'success');
    resetVenta();
    await Promise.all([buscarProductos(), cargarHistorial(), cargarCajaTurnos()]);
  } catch (error) {
    Swal.fire('Error', error.response?.data?.details || 'No se pudo registrar la venta.', 'error');
  }
};

const guardarGasto = async () => {
  if (!gastoForm.value.descripcion || Number(gastoForm.value.monto) <= 0) {
    Swal.fire('Atención', 'Descripción y monto mayor a cero son obligatorios.', 'warning');
    return;
  }

  try {
    await axios.post('/ventas-diarias/gastos', gastoForm.value);
    Swal.fire('Gasto registrado', 'El gasto diario se registró correctamente.', 'success');
    gastoForm.value = {
      fecha: today,
      categoria: 'Compra de insumos',
      descripcion: '',
      monto: 0,
      metodoPago: 'Efectivo',
      comprobante: '',
      observaciones: '',
    };
    await Promise.all([cargarHistorial(), cargarCajaTurnos()]);
  } catch (error) {
    Swal.fire('Error', error.response?.data?.details || 'No se pudo registrar el gasto.', 'error');
  }
};

const guardarPlanilla = async () => {
  if (!planillaForm.value.concepto || Number(planillaForm.value.monto) <= 0) {
    Swal.fire('Atención', 'Concepto y monto son obligatorios.', 'warning');
    return;
  }

  try {
    await axios.post('/ventas-diarias/planillas', planillaForm.value);
    Swal.fire('Planilla registrada', 'El registro fue guardado correctamente.', 'success');

    planillaForm.value = {
      fecha: today,
      tipoPlanilla: planillaForm.value.tipoPlanilla,
      categoria: planillaForm.value.tipoPlanilla === 'TIENDA' ? 'Silicona' : 'Pago sueldos',
      concepto: '',
      monto: 0,
      metodoPago: 'Efectivo',
      observaciones: '',
    };

    await Promise.all([cargarHistorial(), cargarCajaTurnos()]);
  } catch (error) {
    Swal.fire('Error', error.response?.data?.details || 'No se pudo registrar la planilla.', 'error');
  }
};

const abrirTurnoCaja = async () => {
  if (Number(cajaAperturaForm.value.saldoInicial) < 0) {
    Swal.fire('Atención', 'Saldo inicial no válido.', 'warning');
    return;
  }

  try {
    await axios.post('/ventas-diarias/caja-turnos/apertura', cajaAperturaForm.value);
    Swal.fire('Turno abierto', 'La apertura de caja fue registrada.', 'success');
    await cargarCajaTurnos();
  } catch (error) {
    Swal.fire('Error', error.response?.data?.details || error.response?.data?.error || 'No se pudo abrir el turno.', 'error');
  }
};

const cerrarTurnoCaja = async () => {
  if (!cajaCierreForm.value.turnoId) {
    Swal.fire('Atención', 'Debe seleccionar un turno abierto.', 'warning');
    return;
  }

  try {
    await axios.post(`/ventas-diarias/caja-turnos/cierre/${cajaCierreForm.value.turnoId}`, {
      saldoArqueo: cajaCierreForm.value.saldoArqueo,
      ingresosExtra: cajaCierreForm.value.ingresosExtra,
      observaciones: cajaCierreForm.value.observaciones,
    });

    Swal.fire('Turno cerrado', 'El cierre con arqueo se registró correctamente.', 'success');
    cajaCierreForm.value = { turnoId: '', saldoArqueo: 0, ingresosExtra: 0, observaciones: '' };
    await cargarCajaTurnos();
  } catch (error) {
    Swal.fire('Error', error.response?.data?.details || error.response?.data?.error || 'No se pudo cerrar el turno.', 'error');
  }
};

const cargarHistorial = async () => {
  try {
    const params = {
      fechaInicio: filtro.value.fechaInicio,
      fechaFin: filtro.value.fechaFin,
      page: 1,
      limit: 100,
    };

    const [ventasResp, gastosResp, planillasResp, resumenResp] = await Promise.allSettled([
      axios.get('/ventas-diarias/ventas', { params }),
      axios.get('/ventas-diarias/gastos', { params }),
      axios.get('/ventas-diarias/planillas', { params }),
      axios.get('/ventas-diarias/resumen', { params }),
    ]);

    const errores = [];

    if (ventasResp.status === 'fulfilled') {
      ventas.value = ventasResp.value.data.data || [];
    } else {
      ventas.value = [];
      errores.push(`ventas: ${ventasResp.reason?.response?.status || 'sin respuesta'}`);
    }

    if (gastosResp.status === 'fulfilled') {
      gastos.value = gastosResp.value.data.data || [];
    } else {
      gastos.value = [];
      errores.push(`gastos: ${gastosResp.reason?.response?.status || 'sin respuesta'}`);
    }

    if (planillasResp.status === 'fulfilled') {
      planillas.value = planillasResp.value.data.data || [];
    } else {
      planillas.value = [];
      errores.push(`planillas: ${planillasResp.reason?.response?.status || 'sin respuesta'}`);
    }

    if (resumenResp.status === 'fulfilled') {
      resumen.value = resumenResp.value.data || {};
    } else {
      resumen.value = {};
      errores.push(`resumen: ${resumenResp.reason?.response?.status || 'sin respuesta'}`);
    }

    if (errores.length) {
      console.warn('Carga parcial en historial diario:', errores.join(' | '));
      Swal.fire('Carga parcial', `Algunos datos no se pudieron cargar (${errores.join(', ')}).`, 'warning');
    }
  } catch (error) {
    console.error('Error al cargar historial diario', error);
    Swal.fire('Error', 'No se pudo cargar el historial diario.', 'error');
  }
};

const cargarCajaTurnos = async () => {
  try {
    const response = await axios.get('/ventas-diarias/caja-turnos', {
      params: {
        fechaInicio: filtro.value.fechaInicio,
        fechaFin: filtro.value.fechaFin,
        page: 1,
        limit: 100,
      },
    });
    cajaTurnos.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar caja turnos', error);
  }
};

const cargarReporteMensual = async () => {
  try {
    const response = await axios.get('/ventas-diarias/reporte-ejecutivo/mensual', {
      params: {
        year: reporteFiltro.value.year,
        month: reporteFiltro.value.month,
      },
    });
    reporteMensual.value = response.data;
  } catch (error) {
    const details = error.response?.data?.details || '';
    const shouldFallback = error.response?.status === 500 || error.response?.status === 404;

    if (!shouldFallback) {
      Swal.fire('Error', details || 'No se pudo generar el reporte mensual.', 'error');
      return;
    }

    try {
      const y = Number(reporteFiltro.value.year);
      const m = Number(reporteFiltro.value.month);
      const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
      const endDate = `${y}-${String(m).padStart(2, '0')}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`;

      const params = { fechaInicio: startDate, fechaFin: endDate, page: 1, limit: 2000 };
      const [ventasResp, gastosResp, planillasResp, cajaResp, resumenResp] = await Promise.all([
        axios.get('/ventas-diarias/ventas', { params }),
        axios.get('/ventas-diarias/gastos', { params }),
        axios.get('/ventas-diarias/planillas', { params }),
        axios.get('/ventas-diarias/caja-turnos', { params }),
        axios.get('/ventas-diarias/resumen', { params }),
      ]);

      const ventasData = ventasResp.data.data || [];
      const topMap = new Map();

      ventasData.forEach((venta) => {
        (venta.detalles || []).forEach((d) => {
          const key = d.nombreProducto || `Producto ${d.productoId}`;
          const current = topMap.get(key) || {
            nombreProducto: key,
            cantidadTotal: 0,
            montoTotal: 0,
            gananciaTotal: 0,
          };

          current.cantidadTotal += Number(d.cantidad || 0);
          current.montoTotal += Number(d.subtotal || 0);
          current.gananciaTotal += Number(d.ganancia || 0);
          topMap.set(key, current);
        });
      });

      const topProductos = Array.from(topMap.values())
        .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
        .slice(0, 20);

      reporteMensual.value = {
        periodo: { year: y, month: m, startDate, endDate },
        resumen: resumenResp.data || {},
        ventas: ventasData,
        gastos: gastosResp.data.data || [],
        planillas: planillasResp.data.data || [],
        cajaTurnos: cajaResp.data.data || [],
        topProductos,
      };

      Swal.fire(
        'Reporte en modo compatibilidad',
        'El endpoint ejecutivo falló y se generó el reporte con agregación desde endpoints base.',
        'warning'
      );
    } catch (fallbackError) {
      Swal.fire(
        'Error',
        details || fallbackError.response?.data?.details || 'No se pudo generar el reporte mensual.',
        'error'
      );
    }
  }
};

const crearFilasReporteDiario = () => {
  const filasVentas = ventas.value.map((venta) => ({
    tipo: 'VENTA',
    fecha: venta.fecha,
    documento: venta.numeroVenta || '',
    cliente: venta.clienteNombre || 'Mostrador',
    categoria: '',
    descripcion: venta.observaciones || '',
    metodoPago: venta.metodoPago,
    ingreso: Number(venta.total || 0),
    egreso: 0,
    saldo: Number(venta.total || 0),
  }));

  const filasGastos = gastos.value.map((gasto) => ({
    tipo: 'GASTO',
    fecha: gasto.fecha,
    documento: gasto.comprobante || '',
    cliente: '',
    categoria: gasto.categoria,
    descripcion: gasto.descripcion,
    metodoPago: gasto.metodoPago,
    ingreso: 0,
    egreso: Number(gasto.monto || 0),
    saldo: -Number(gasto.monto || 0),
  }));

  const filasPlanillas = planillas.value.map((p) => ({
    tipo: p.tipoPlanilla,
    fecha: p.fecha,
    documento: '',
    cliente: '',
    categoria: p.categoria,
    descripcion: p.concepto,
    metodoPago: p.metodoPago,
    ingreso: 0,
    egreso: Number(p.monto || 0),
    saldo: -Number(p.monto || 0),
  }));

  return [...filasVentas, ...filasGastos, ...filasPlanillas].sort((a, b) => (a.fecha > b.fecha ? 1 : -1));
};

const exportarExcelDiario = () => {
  const filas = crearFilasReporteDiario();
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), 'MovimientosDiarios');
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      {
        totalVentas: Number(resumen.value.totalVentas || 0),
        totalGastosOperativos: Number(resumen.value.totalGastosOperativos || 0),
        totalPlanillas: Number(resumen.value.totalPlanillas || 0),
        utilidadNeta: Number(resumen.value.utilidadNeta || 0),
      },
    ]),
    'ResumenDiario'
  );

  XLSX.writeFile(wb, `diario_${filtro.value.fechaInicio}_${filtro.value.fechaFin}.xlsx`);
};

const exportarCSVDiario = () => {
  const filas = crearFilasReporteDiario();
  const headers = ['tipo', 'fecha', 'documento', 'cliente', 'categoria', 'descripcion', 'metodoPago', 'ingreso', 'egreso', 'saldo'];
  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csvContent = [headers.join(','), ...filas.map((fila) => headers.map((h) => escapeCsv(fila[h])).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `diario_${filtro.value.fechaInicio}_${filtro.value.fechaFin}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportarExcelReporteMensual = async () => {
  if (!reporteMensual.value.periodo) {
    await cargarReporteMensual();
  }

  const reporte = reporteMensual.value;
  const wb = XLSX.utils.book_new();

  const resumenSheet = XLSX.utils.json_to_sheet([
    {
      periodo: `${reporte.periodo?.year}-${String(reporte.periodo?.month || '').padStart(2, '0')}`,
      totalVentas: Number(reporte.resumen?.totalVentas || 0),
      totalDescuentos: Number(reporte.resumen?.totalDescuentos || 0),
      gastosOperativos: Number(reporte.resumen?.totalGastosOperativos || 0),
      planillas: Number(reporte.resumen?.totalPlanillas || 0),
      totalGastos: Number(reporte.resumen?.totalGastos || 0),
      utilidadNeta: Number(reporte.resumen?.utilidadNeta || 0),
      productosVendidos: Number(reporte.resumen?.totalProductosVendidos || 0),
      planillaTienda: Number(reporte.resumen?.totalInsumosTienda || 0),
      planillaSueldosServicios: Number(reporte.resumen?.totalSueldosServicios || 0),
    },
  ]);

  XLSX.utils.book_append_sheet(wb, resumenSheet, 'Resumen');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reporte.ventas || []), 'Ventas');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reporte.gastos || []), 'Gastos');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reporte.planillas || []), 'Planillas');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reporte.cajaTurnos || []), 'CajaTurnos');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reporte.topProductos || []), 'TopProductos');

  XLSX.writeFile(wb, `reporte_ejecutivo_${reporteFiltro.value.year}_${String(reporteFiltro.value.month).padStart(2, '0')}.xlsx`);
};

const sincronizarGoogleSheets = async () => {
  try {
    await axios.post('/ventas-diarias/google-sheets/sync', {
      year: reporteFiltro.value.year,
      month: reporteFiltro.value.month,
      spreadsheetId: googleSheetsForm.value.spreadsheetId || undefined,
    });

    Swal.fire('Sincronización completa', 'Los datos fueron enviados a Google Sheets.', 'success');
  } catch (error) {
    Swal.fire('Error', error.response?.data?.details || error.response?.data?.error || 'No se pudo sincronizar Google Sheets.', 'error');
  }
};

onMounted(async () => {
  await Promise.all([buscarProductos(), cargarHistorial(), cargarCajaTurnos(), cargarReporteMensual()]);
});
</script>

<style scoped>
.input-field {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white;
}

.field-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}

.btn-primary {
  @apply px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800;
}

.btn-warning {
  @apply px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700;
}

.btn-success {
  @apply px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700;
}

.btn-light {
  @apply px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200;
}

.summary-card {
  @apply bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3;
}

.summary-label {
  @apply text-xs text-gray-500 uppercase;
}

.summary-value {
  @apply text-lg font-semibold;
}

.panel-table {
  @apply border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden;
}

.panel-title {
  @apply px-4 py-2 bg-gray-100 dark:bg-gray-700 font-medium text-gray-800 dark:text-gray-100;
}

.table-wrapper {
  @apply max-h-80 overflow-y-auto overflow-x-auto;
}

.table-sm {
  @apply w-full min-w-[560px] text-sm text-left;
}

.table-sm thead {
  @apply bg-gray-50 dark:bg-gray-800;
}

.table-sm th {
  @apply px-3 py-2;
}

.table-sm td {
  @apply px-3 py-2 border-t border-gray-100 dark:border-gray-700;
}

.empty-row {
  @apply text-center text-gray-500;
}
</style>
