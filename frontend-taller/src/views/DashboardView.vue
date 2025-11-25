<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <div class="max-w-[1920px] mx-auto">
      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Panel de control y monitoreo</p>
      </div>

      <!-- Main Grid Layout - Responsive -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        <!-- Left Column: Main Table (Takes full width on mobile, 8 cols on large screens) -->
        <div class="lg:col-span-8 space-y-4 md:space-y-6">
          
          <!-- Últimas Visitas Section -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Últimas Visitas</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Últimos clientes atendidos</p>
            </div>
            <div class="p-4">
              <TablaDashboard />
            </div>
          </div>

        </div>

        <!-- Right Column: Stats & Products (Takes full width on mobile, 4 cols on large screens) -->
        <div class="lg:col-span-4 space-y-4 md:space-y-6">
          
          <!-- Sales Summary Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Resumen de Ventas</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Estadísticas del período</p>
            </div>
            <div class="p-4">
              <MenuDashboard />
            </div>
          </div>

          <!-- Low Stock Products Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Productos con Stock Bajo</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Requieren reposición</p>
            </div>
            <div class="p-4 max-h-[600px] overflow-y-auto">
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
  