<!-- ProductHistoryView.vue -->
<template>
    <div class="py-8 px-4 mx-auto max-w-screen-2xl lg:px-6">
      <div class="relative bg-white dark:bg-gray-800 sm:rounded-lg overflow-hidden">
        <!-- Título y filtros -->
        <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
          <div class="w-full md:w-1/2">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Historial de Productos
            </h2>
          </div>
          <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
            <!-- Filtro de período -->
            <select v-model="periodoSeleccionado" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
            <!-- Selector de fecha -->
            <input 
              type="month" 
              v-if="periodoSeleccionado === 'mensual'"
              v-model="fechaSeleccionada"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
            <input 
              type="number" 
              v-else
              v-model="yearSeleccionado"
              placeholder="Año"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
          </div>
        </div>
  
        <!-- Tabla de historial -->
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">Fecha De Venta</th>
                <th scope="col" class="px-6 py-3">Producto</th>
                <th scope="col" class="px-6 py-3">Cliente</th>
                <th scope="col" class="px-6 py-3">Vehículo</th>
                <th scope="col" class="px-6 py-3">Cantidad</th>
                <th scope="col" class="px-6 py-3">Precio Costo</th>
                <th scope="col" class="px-6 py-3">Precio Venta</th>
                <th scope="col" class="px-6 py-3">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registro in registrosFiltrados" :key="registro.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-6 py-4">{{ formatDate(registro.fechaSalida) }}</td>
                <td class="px-6 py-4">{{ registro.producto }}</td>
                <td class="px-6 py-4">{{ registro.cliente }}</td>
                <td class="px-6 py-4">{{ registro.vehiculo }}</td>
                <td class="px-6 py-4">{{ registro.cantidad }}</td>
                <td class="px-6 py-4">{{ formatCurrency(registro.precioCosto) }}</td>
                <td class="px-6 py-4">{{ formatCurrency(registro.precioVenta) }}</td>
                <td class="px-6 py-4">{{ formatCurrency(registro.ganancia) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Resumen de totales -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 m-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Vendido</h3>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ formatCurrency(totalVendido) }}
            </p>
          </div>
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Costo</h3>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ formatCurrency(totalCosto) }}
            </p>
          </div>
          <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ganancia Total</h3>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ formatCurrency(gananciaTotal) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const periodoSeleccionado = ref('mensual');
  const fechaSeleccionada = ref(new Date().toISOString().slice(0, 7));
  const yearSeleccionado = ref(new Date().getFullYear());
  
  // Simulated data - replace with actual API calls
  const registrosHistorial = ref([
    {
      id: 1,
      fechaSalida: '2024-03-15',
      producto: 'Producto A',
      cliente: 'Cliente 1',
      vehiculo: 'Toyota Corolla',
      cantidad: 2,
      precioCosto: 50,
      precioVenta: 75,
      ganancia: 50
    },
    // Add more sample data as needed
  ]);
  
  // Computed properties for filtered data
  const registrosFiltrados = computed(() => {
    return registrosHistorial.value.filter(registro => {
      const fecha = new Date(registro.fechaSalida);
      if (periodoSeleccionado.value === 'mensual') {
        return registro.fechaSalida.startsWith(fechaSeleccionada.value);
      } else {
        return fecha.getFullYear() === parseInt(yearSeleccionado.value);
      }
    });
  });
  
  // Computed properties for totals
  const totalVendido = computed(() => {
    return registrosFiltrados.value.reduce((sum, registro) => 
      sum + (registro.precioVenta * registro.cantidad), 0);
  });
  
  const totalCosto = computed(() => {
    return registrosFiltrados.value.reduce((sum, registro) => 
      sum + (registro.precioCosto * registro.cantidad), 0);
  });
  
  const gananciaTotal = computed(() => {
    return totalVendido.value - totalCosto.value;
  });
  
  // Utility functions
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };
  </script>