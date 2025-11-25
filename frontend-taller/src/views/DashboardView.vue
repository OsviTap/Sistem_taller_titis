<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <div class="max-w-[1920px] mx-auto">
      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Panel de control y monitoreo</p>
      </div>

      <!-- Main Layout - Vertical Stack -->
      <div class="space-y-4 md:space-y-6">
        
        <!-- Últimas Visitas - Full Width Top Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Últimas Visitas</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Últimos clientes atendidos en el taller</p>
              </div>
            </div>
          </div>
          <div class="p-4">
            <TablaDashboard />
          </div>
        </div>

        <!-- Bottom Grid: Stats & Products (Side by Side) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          
          <!-- Sales Summary Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Resumen de Ventas</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Estadísticas del período seleccionado</p>
                </div>
              </div>
            </div>
            <div class="p-4">
              <MenuDashboard />
            </div>
          </div>

          <!-- Low Stock Products Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900">
                  <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Productos con Stock Bajo</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Productos que requieren reposición</p>
                </div>
              </div>
            </div>
            <div class="p-4 max-h-[500px] overflow-y-auto">
              <TablaInfoProductos />
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { renderChart } from '../utils/Chart'; // Asegúrate de la ruta correcta
import TablaDashboard from '../components/TablaDashboard.vue'; // Asegúrate de la ruta correcta
import MenuDashboard from '@/components/MenuDashboard.vue';
import TablaInfoProductos from '@/components/TablaInfoProductos.vue';

export default {
  components: {
    TablaDashboard,
    MenuDashboard,
    TablaInfoProductos,
  },
  setup() {
    onMounted(() => {
      renderChart("data-series-chart"); // Llama a la función para renderizar el gráfico
    });
  },
};
</script>

<style>
/* Puedes agregar estilos adicionales aquí si es necesario */

</style>
  