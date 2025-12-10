<template>
  <div class="w-full">
  <!-- Search bar -->
  <div class="mb-4 relative">
    <input
      v-model="searchQuery"
      type="text"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      placeholder="Buscar cliente, vehículo o placa..."
      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    />
    <!-- Sugerencias de búsqueda -->
    <div v-if="showSuggestions && recentSearches.length > 0" class="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 dark:bg-gray-700 dark:border-gray-600">
      <div class="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600">Búsquedas recientes</div>
      <ul>
        <li 
          v-for="(term, index) in recentSearches" 
          :key="index"
          @click="applySearch(term)"
          class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-600 flex justify-between items-center"
        >
          <span>{{ term }}</span>
          <button @click.stop="removeSearch(index)" class="text-gray-400 hover:text-red-500">×</button>
        </li>
      </ul>
    </div>
  </div>

  <!-- Table container -->
  <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <div class="max-h-[450px] overflow-y-auto">
      <table class="w-full table-auto text-sm">
        <thead class="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
          <tr class="border-b border-gray-200 dark:border-gray-600">
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Cliente</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Vehículo</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Placa</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Última Visita</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[260px]">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          <tr v-for="cliente in paginatedClientes" 
              :key="cliente.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">{{ cliente.Cliente?.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{{ formatVehiculo(cliente.Vehiculo) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ cliente.Vehiculo?.placa }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{{ formatDate(cliente.fecha) }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <button 
                  @click="verUltimaVisita(cliente)"
                  class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all">
                  <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Ver Visita
                </button>
                <button 
                  @click="verHistorialVehiculo(cliente)"
                  class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all">
                  <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Historial
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

    <!-- Paginación -->
    <div class="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
      <select 
        v-model="itemsPerPage" 
        class="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <option value="5">5 por página</option>
        <option value="10">10 por página</option>
        <option value="20">20 por página</option>
      </select>
      
      <div class="flex items-center gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors">
          Anterior
        </button>
        <span class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors">
          Siguiente
        </button>
      </div>
    </div>
  </div>

  <!-- Modal: Última Visita -->
  <Teleport to="body">
    <div v-if="modalUltimaVisita" class="fixed inset-0 z-50 overflow-y-auto" @click="cerrarModalUltimaVisita">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

        <!-- Modal Panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" @click.stop>
          <!-- Header -->
          <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-white flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Última Visita - {{ visitaSeleccionada?.Cliente?.nombre }}
              </h3>
              <button @click="cerrarModalUltimaVisita" class="text-white hover:text-gray-200 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div v-if="cargandoDetalle" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600"></div>
              <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando información...</p>
            </div>

            <div v-else-if="detalleVisita">
              <!-- Información General -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Cliente
                  </h4>
                  <p class="text-gray-900 dark:text-white font-medium">{{ detalleVisita.Cliente?.nombre }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Tel: {{ detalleVisita.Cliente?.telefono || 'N/A' }}</p>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
                    </svg>
                    Vehículo
                  </h4>
                  <p class="text-gray-900 dark:text-white font-medium">{{ formatVehiculo(detalleVisita.Vehiculo) }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Placa: {{ detalleVisita.Vehiculo?.placa }}</p>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-700 dark:text-gray-200 mb-2">Fecha</h4>
                  <p class="text-gray-900 dark:text-white">{{ formatDate(detalleVisita.fecha) }}</p>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-700 dark:text-gray-200 mb-2">Kilometraje</h4>
                  <p class="text-gray-900 dark:text-white">{{ detalleVisita.kilometraje?.toLocaleString() }} km</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Próximo: {{ detalleVisita.proximoCambio?.toLocaleString() }} km</p>
                </div>
              </div>

              <!-- Servicios y Productos -->
              <div class="space-y-4">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Servicios y Productos</h4>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th class="px-4 py-2 text-left">Tipo</th>
                        <th class="px-4 py-2 text-left">Descripción</th>
                        <th class="px-4 py-2 text-center">Cantidad</th>
                        <th class="px-4 py-2 text-right">Precio Unit.</th>
                        <th class="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-for="detalle in detalleVisita.detalles" :key="detalle.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-4 py-2">
                          <span :class="detalle.tipo === 'Producto' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'" class="px-2 py-1 rounded text-xs font-medium">
                            {{ detalle.tipo }}
                          </span>
                        </td>
                        <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ detalle.nombre || 'N/A' }}</td>
                        <td class="px-4 py-2 text-center">{{ detalle.cantidad }}</td>
                        <td class="px-4 py-2 text-right">Bs {{ parseFloat(detalle.precio).toFixed(2) }}</td>
                        <td class="px-4 py-2 text-right font-medium">Bs {{ parseFloat(detalle.subtotal).toFixed(2) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Totales -->
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 mt-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-700 dark:text-gray-300">Descuento:</span>
                    <span class="font-medium text-gray-900 dark:text-white">Bs {{ parseFloat(detalleVisita.descuento || 0).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span class="text-gray-900 dark:text-white">Total:</span>
                    <span class="text-green-600 dark:text-green-400">Bs {{ parseFloat(detalleVisita.total).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm mt-1">
                    <span class="text-gray-600 dark:text-gray-400">Tipo de Pago:</span>
                    <span class="font-medium text-gray-700 dark:text-gray-300">{{ detalleVisita.tipoPago }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
            <div v-if="vehiculoSeleccionado" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Al cerrar, volverás al historial</span>
            </div>
            <div v-else class="flex-1"></div>
            <div class="flex gap-3">
              <button v-if="!vehiculoSeleccionado" @click="irAHistorialCompleto(visitaSeleccionada)" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Ver Historial Completo
              </button>
              <button @click="cerrarModalUltimaVisita" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors">
                {{ vehiculoSeleccionado ? 'Volver al Historial' : 'Cerrar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal: Historial Completo del Vehículo -->
  <Teleport to="body">
    <div v-if="modalHistorial" class="fixed inset-0 z-50 overflow-y-auto" @click="cerrarModalHistorial">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

        <!-- Modal Panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full" @click.stop>
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-white flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Historial Completo - {{ vehiculoSeleccionado?.Cliente?.nombre }}
              </h3>
              <button @click="cerrarModalHistorial" class="text-white hover:text-gray-200 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 max-h-[75vh] overflow-y-auto">
            <div v-if="cargandoHistorial" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando historial...</p>
            </div>

            <div v-else-if="historialVehiculo.length > 0">
              <!-- Info del Vehículo -->
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ vehiculoSeleccionado?.Cliente?.nombre }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Vehículo</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ formatVehiculo(vehiculoSeleccionado?.Vehiculo) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Placa</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ vehiculoSeleccionado?.Vehiculo?.placa }}</p>
                  </div>
                </div>
                <div class="mt-3 flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Total de visitas: <strong class="ml-1">{{ historialVehiculo.length }}</strong>
                </div>
              </div>

              <!-- Timeline de Visitas -->
              <div class="space-y-4">
                <div v-for="(visita, index) in historialVehiculo" :key="visita.id" class="relative">
                  <!-- Line connector -->
                  <div v-if="index < historialVehiculo.length - 1" class="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  
                  <div class="flex gap-4">
                    <!-- Timeline dot -->
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm z-10">
                      {{ index + 1 }}
                    </div>

                    <!-- Visita Card -->
                    <div class="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div class="p-4">
                        <div class="flex justify-between items-start mb-3">
                          <div class="flex-1">
                            <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(visita.fecha) }}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Km: {{ visita.kilometraje?.toLocaleString() }} → Próximo: {{ visita.proximoCambio?.toLocaleString() }}</p>
                          </div>
                          <div class="text-right">
                            <p class="text-lg font-bold text-green-600 dark:text-green-400">Bs {{ parseFloat(visita.total).toFixed(2) }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ visita.tipoPago }}</p>
                          </div>
                        </div>

                        <!-- Resumen de items -->
                        <div v-if="visita.detalles && visita.detalles.length > 0" class="mt-3 mb-3">
                          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {{ visita.detalles.length }} item(s) - 
                            <span class="text-blue-600">{{ contarProductos(visita.detalles) }} producto(s)</span>, 
                            <span class="text-green-600">{{ contarServicios(visita.detalles) }} servicio(s)</span>
                          </p>
                        </div>

                        <!-- Botón Ver Detalles -->
                        <button 
                          @click="verDetallesVisitaHistorial(visita)"
                          class="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all flex items-center justify-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          Ver Detalles Completos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="mt-2 text-gray-600 dark:text-gray-400">No hay historial disponible</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end">
            <button @click="cerrarModalHistorial" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/api/axios';

export default {
  setup() {
    const router = useRouter();

    const searchQuery = ref('');
    const showSuggestions = ref(false);
    const recentSearches = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const clientes = ref([]);
    const totalItems = ref(0);

    // Estados para modales
    const modalUltimaVisita = ref(false);
    const modalHistorial = ref(false);
    const visitaSeleccionada = ref(null);
    const vehiculoSeleccionado = ref(null);
    const detalleVisita = ref(null);
    const historialVehiculo = ref([]);
    const cargandoDetalle = ref(false);
    const cargandoHistorial = ref(false);

    // Computed properties simplificadas para usar datos del backend
    const filteredClientes = computed(() => clientes.value);

    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage.value);
    });

    const paginatedClientes = computed(() => clientes.value);

    const formatVehiculo = (vehiculo) => {
      if (!vehiculo) return 'N/A';
      return `${vehiculo.marcaVehiculo?.nombre || ''} ${vehiculo.modeloVehiculo?.nombre || ''}`.trim();
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const verUltimaVisita = async (cliente) => {
      visitaSeleccionada.value = cliente;
      modalUltimaVisita.value = true;
      cargandoDetalle.value = true;

      try {
        // Obtener el detalle completo de la visita
        const response = await axios.get(`/visitas/${cliente.visitaId || cliente.id}`);
        detalleVisita.value = response.data;
      } catch (error) {
        console.error('Error al obtener detalle de visita:', error);
        detalleVisita.value = null;
      } finally {
        cargandoDetalle.value = false;
      }
    };

    const verHistorialVehiculo = async (cliente) => {
      vehiculoSeleccionado.value = cliente;
      modalHistorial.value = true;
      cargandoHistorial.value = true;

      try {
        // Obtener todas las visitas del vehículo
        const response = await axios.get('/visitas', {
          params: {
            vehiculoId: cliente.vehiculoId,
            limit: 100 // Traer todas las visitas
          }
        });
        historialVehiculo.value = response.data.data || [];
      } catch (error) {
        console.error('Error al obtener historial:', error);
        historialVehiculo.value = [];
      } finally {
        cargandoHistorial.value = false;
      }
    };

    const cerrarModalUltimaVisita = () => {
      modalUltimaVisita.value = false;
      detalleVisita.value = null;
      visitaSeleccionada.value = null;
      // Si hay un vehículo seleccionado, significa que venimos del historial
      // Podemos volver a abrir el modal de historial
      if (vehiculoSeleccionado.value) {
        setTimeout(() => {
          modalHistorial.value = true;
        }, 300); // Pequeño delay para transición suave
      }
    };

    const cerrarModalHistorial = () => {
      modalHistorial.value = false;
      historialVehiculo.value = [];
      vehiculoSeleccionado.value = null;
    };

    const irAHistorialCompleto = (cliente) => {
      cerrarModalUltimaVisita();
      router.push({
        path: '/historial',
        query: {
          clienteId: cliente.clienteId,
          vehiculoId: cliente.vehiculoId
        }
      });
    };

    const verDetallesVisitaHistorial = async (visita) => {
      // Cerrar modal de historial y abrir modal de detalle
      modalHistorial.value = false;
      visitaSeleccionada.value = {
        ...visita,
        Cliente: vehiculoSeleccionado.value?.Cliente,
        Vehiculo: vehiculoSeleccionado.value?.Vehiculo
      };
      modalUltimaVisita.value = true;
      cargandoDetalle.value = true;

      try {
        const response = await axios.get(`/visitas/${visita.id}`);
        detalleVisita.value = response.data;
      } catch (error) {
        console.error('Error al obtener detalle de visita:', error);
        detalleVisita.value = visita; // Usar datos que ya tenemos
      } finally {
        cargandoDetalle.value = false;
      }
    };

    const contarProductos = (detalles) => {
      return detalles.filter(d => d.tipo === 'Producto').length;
    };

    const contarServicios = (detalles) => {
      return detalles.filter(d => d.tipo === 'Servicio').length;
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const handleBlur = () => {
      setTimeout(() => {
        showSuggestions.value = false;
      }, 200);
    };

    const applySearch = (term) => {
      searchQuery.value = term;
      showSuggestions.value = false;
      currentPage.value = 1;
      obtenerUltimasVisitas();
    };

    const removeSearch = (index) => {
      recentSearches.value.splice(index, 1);
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value));
    };

    const saveSearch = (term) => {
      if (!term || term.trim().length < 2) return;
      const history = [...recentSearches.value];
      const index = history.indexOf(term);
      if (index > -1) {
        history.splice(index, 1);
      }
      history.unshift(term);
      if (history.length > 5) history.pop();
      recentSearches.value = history;
      localStorage.setItem('recentSearches', JSON.stringify(history));
    };

    // Esta función debe cargar o actualizar la lista de clientes
    const obtenerUltimasVisitas = async () => {
      try {
        if (searchQuery.value) {
          saveSearch(searchQuery.value);
        }

        const response = await axios.get('/visitas', {
          params: {
            page: currentPage.value,
            limit: itemsPerPage.value,
            search: searchQuery.value
          }
        });
        
        const visitas = response.data.data || [];
        totalItems.value = response.data.totalItems || 0;
        
        // Mapear correctamente según lo que espera el template
        clientes.value = visitas.map(visita => ({
          id: visita.id,
          clienteId: visita.clienteId,
          vehiculoId: visita.vehiculoId,
          fecha: visita.fecha,
          visitaId: visita.id,
          // El template espera Cliente y Vehiculo como objetos
          Cliente: visita.Cliente || { nombre: 'Sin nombre' },
          Vehiculo: visita.Vehiculo || { 
            placa: 'Sin placa',
            marcaVehiculo: { nombre: 'Sin marca' },
            modeloVehiculo: { nombre: 'Sin modelo' }
          }
        }));
      } catch (error) {
        console.error('Error al obtener últimas visitas:', error);
        clientes.value = [];
        totalItems.value = 0;
      }
    };

    let timeout;
    watch(searchQuery, () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentPage.value = 1;
        obtenerUltimasVisitas();
      }, 500);
    });

    watch([currentPage, itemsPerPage], () => {
      obtenerUltimasVisitas();
    });

    onMounted(() => {
      recentSearches.value = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      obtenerUltimasVisitas();
    });

    return {
      searchQuery,
      showSuggestions,
      recentSearches,
      handleBlur,
      applySearch,
      removeSearch,
      currentPage,
      itemsPerPage,
      filteredClientes,
      paginatedClientes,
      totalPages,
      formatVehiculo,
      formatDate,
      verUltimaVisita,
      verHistorialVehiculo,
      prevPage,
      nextPage,
      // Modales
      modalUltimaVisita,
      modalHistorial,
      visitaSeleccionada,
      vehiculoSeleccionado,
      detalleVisita,
      historialVehiculo,
      cargandoDetalle,
      cargandoHistorial,
      cerrarModalUltimaVisita,
      cerrarModalHistorial,
      irAHistorialCompleto,
      verDetallesVisitaHistorial,
      contarProductos,
      contarServicios
    };
  }
};
</script>