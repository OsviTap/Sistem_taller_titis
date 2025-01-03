<template>
  <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-4">
      <!-- Main content area -->
      <div class="xl:col-span-3">
        <div class="grid grid-rows-[3fr,1fr] gap-4 h-[calc(100vh-2rem)]">
          <!-- Table section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <TablaDashboard />
          </div>
          <!-- Menu Dashboard (donut chart) -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <MenuDashboard />
          </div>
        </div>
      </div>
      
      <!-- Right sidebar -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-[calc(100vh-2rem)]">
        <TablaInfoProductos />
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
  