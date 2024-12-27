<template>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Historial de Visitas</h1>
        
        <!-- Filtros -->
        <div class="flex gap-4">
          <div class="w-64">
            <label for="clienteFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
            <select v-model="clienteFilter" id="clienteFilter" class="input-select">
              <option value="">Todos los clientes</option>
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                {{ cliente.nombre }}
              </option>
            </select>
          </div>
          <div class="flex gap-4">
            <div class="w-40">
              <label for="fechaInicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Inicio
              </label>
              <input 
                type="date" 
                id="fechaInicio" 
                v-model="fechaInicio" 
                class="input-text"
                :max="fechaFin || undefined"
              />
            </div>
            <div class="w-40">
              <label for="fechaFin" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Fin
              </label>
              <input 
                type="date" 
                id="fechaFin" 
                v-model="fechaFin" 
                class="input-text"
                :min="fechaInicio || undefined"
              />
            </div>
            <div class="self-end">
              <button 
                @click="limpiarFechas" 
                class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Limpiar fechas"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Tabla de Historial -->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table id="historialTable" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">Fecha</th>
              <th scope="col" class="px-6 py-3">Cliente</th>
              <th scope="col" class="px-6 py-3">Vehículo</th>
              <th scope="col" class="px-6 py-3">Kilometraje</th>
              <th scope="col" class="px-6 py-3">Próximo Cambio</th>
              <th scope="col" class="px-6 py-3">Total</th>
              <th scope="col" class="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="visita in visitasFiltradas" :key="visita.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td class="px-6 py-4">{{ formatDate(visita.fecha) }}</td>
              <td class="px-6 py-4">{{ visita.cliente }}</td>
              <td class="px-6 py-4">{{ visita.vehiculo }}</td>
              <td class="px-6 py-4">{{ visita.kilometraje }} km</td>
              <td class="px-6 py-4">{{ visita.proximoCambio }} km</td>
              <td class="px-6 py-4">Bs {{ visita.total }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button @click="verDetalles(visita)" class="btn-secondary">Ver</button>
                  <button @click="imprimirComprobante(visita)" class="btn-primary">Imprimir</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal de Detalles -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">Detalles de la Visita</h2>
              <button @click="modalVisible = false" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Cliente</p>
                  <p class="text-gray-900 dark:text-white">{{ visitaSeleccionada?.cliente }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Fecha</p>
                  <p class="text-gray-900 dark:text-white">{{ formatDate(visitaSeleccionada?.fecha) }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Vehículo</p>
                  <p class="text-gray-900 dark:text-white">{{ visitaSeleccionada?.vehiculo }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Kilometraje</p>
                  <p class="text-gray-900 dark:text-white">{{ visitaSeleccionada?.kilometraje }} km</p>
                </div>
              </div>
  
              <div class="mt-6">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3">Servicios y Productos</h3>
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" class="px-4 py-2">Tipo</th>
                      <th scope="col" class="px-4 py-2">Descripción</th>
                      <th scope="col" class="px-4 py-2">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(detalle, index) in visitaSeleccionada?.detalles" :key="index" 
                        class="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                      <td class="px-4 py-2">
                        <span :class="{
                          'px-2 py-1 rounded text-xs font-medium': true,
                          'bg-blue-100 text-blue-800': detalle.tipo === 'Servicio',
                          'bg-green-100 text-green-800': detalle.tipo === 'Producto'
                        }">
                          {{ detalle.tipo }}
                        </span>
                      </td>
                      <td class="px-4 py-2">{{ detalle.nombre }}</td>
                      <td class="px-4 py-2">Bs {{ detalle.precio }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="font-semibold text-gray-900 dark:text-white">
                      <td class="px-4 py-2" colspan="2">Total</td>
                      <td class="px-4 py-2">Bs {{ visitaSeleccionada?.total }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { DataTable } from 'simple-datatables';
  
  const clientes = ref([]);
  const visitas = ref([]);
  const modalVisible = ref(false);
  const visitaSeleccionada = ref(null);
  const clienteFilter = ref('');
  const fechaInicio = ref('');
  const fechaFin = ref('');
  let dataTable = null;
  
  const visitasFiltradas = computed(() => {
    return visitas.value.filter(visita => {
      const cumpleCliente = !clienteFilter.value || visita.clienteId === clienteFilter.value;
      
      // Verificar rango de fechas
      let cumpleFechas = true;
      if (fechaInicio.value) {
        cumpleFechas = cumpleFechas && visita.fecha >= fechaInicio.value;
      }
      if (fechaFin.value) {
        cumpleFechas = cumpleFechas && visita.fecha <= fechaFin.value;
      }
      
      return cumpleCliente && cumpleFechas;
    });
  });
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function verDetalles(visita) {
    visitaSeleccionada.value = visita;
    modalVisible.value = true;
  }
  
  function imprimirComprobante(visita) {
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante de Visita</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .total { text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Comprobante de Servicio</h1>
          <p>Fecha: ${formatDate(visita.fecha)}</p>
        </div>
        
        <div class="details">
          <p><strong>Cliente:</strong> ${visita.cliente}</p>
          <p><strong>Vehículo:</strong> ${visita.vehiculo}</p>
          <p><strong>Kilometraje:</strong> ${visita.kilometraje} km</p>
          <p><strong>Próximo cambio:</strong> ${visita.proximoCambio} km</p>
        </div>
  
        <table class="table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${visita.detalles.map(detalle => `
              <tr>
                <td>${detalle.tipo}</td>
                <td>${detalle.nombre}</td>
                <td>Bs ${detalle.precio}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" class="total">Total:</td>
              <td>Bs ${visita.total}</td>
            </tr>
          </tfoot>
        </table>
  
        <div style="margin-top: 50px; text-align: center;">
          <p>¡Gracias por su preferencia!</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
  
  // Función para limpiar las fechas
  function limpiarFechas() {
    fechaInicio.value = '';
    fechaFin.value = '';
  }
  
  // Validar que fechaFin no sea menor que fechaInicio
  watch(fechaInicio, (newValue) => {
    if (fechaFin.value && newValue > fechaFin.value) {
      fechaFin.value = newValue;
    }
  });
  
  // Actualizar la tabla cuando cambien los filtros
  watch([clienteFilter, fechaInicio, fechaFin], () => {
    if (dataTable) {
      // Destruir y reinicializar la tabla con los datos filtrados
      dataTable.destroy();
      dataTable = new DataTable("#historialTable", {
        perPage: 10,
        perPageSelect: [5, 10, 15, 20, 25],
        labels: {
          placeholder: "Buscar...",
          perPage: "Mostrar registros por página",
          noRows: "No hay registros para mostrar",
          info: "Mostrando {start} a {end} de {rows} registros",
        },
        data: {
          headings: ["Fecha", "Cliente", "Vehículo", "Kilometraje", "Próximo Cambio", "Total", "Acciones"],
          data: visitasFiltradas.value.map(visita => [
            formatDate(visita.fecha),
            visita.cliente,
            visita.vehiculo,
            `${visita.kilometraje} km`,
            `${visita.proximoCambio} km`,
            `Bs ${visita.total}`,
            `<div class="flex gap-2">
              <button onclick="verDetalles(${visita.id})" class="btn-secondary">Ver</button>
              <button onclick="imprimirComprobante(${visita.id})" class="btn-primary">Imprimir</button>
             </div>`
          ])
        }
      });
    }
  });
  
  onMounted(() => {
    // Inicializar DataTable
    dataTable = new DataTable("#historialTable", {
      perPage: 10,
      perPageSelect: [5, 10, 15, 20, 25],
      labels: {
        placeholder: "Buscar...",
        perPage: "Registros por página",
        noRows: "No hay registros para mostrar",
        info: "Mostrando {start} a {end} de {rows} registros",
      }
    });
  
    // Cargar datos simulados
    clientes.value = [
      { id: 1, nombre: 'Juan Perez' },
      { id: 2, nombre: 'Maria Lopez' }
    ];
  
    visitas.value = [
      {
        id: 1,
        fecha: '2024-01-15',
        cliente: 'Juan Perez',
        clienteId: 1,
        vehiculo: 'Toyota Corolla - ABC123',
        kilometraje: 15000,
        proximoCambio: 20000,
        total: 350,
        detalles: [
          { tipo: 'Servicio', nombre: 'Cambio de aceite', precio: 150 },
          { tipo: 'Producto', nombre: 'Aceite Motor 5W-30', precio: 200 }
        ]
      },
      // Agregar más datos de ejemplo según sea necesario
    ];
  });
  </script>
  
  <style scoped>
  .input-select, .input-text {
    @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
  }
  .btn-primary {
    @apply px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700;
  }
  .btn-secondary {
    @apply px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700;
  }
  </style>