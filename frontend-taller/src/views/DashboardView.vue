<template>
  <div class="flex flex-col md:flex-row">
    <div class="w-full md:w-1/2 p-5">
      <TablaDashboard />
    </div>
    <div class="w-full md:w-1/2 p-5 ">
      <MenuDashboard />  
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { renderChart } from '../utils/Chart'; // Asegúrate de la ruta correcta
import TablaDashboard from '../components/TablaDashboard.vue'; // Asegúrate de la ruta correcta
import MenuDashboard from '@/components/MenuDashboard.vue';

export default {
  components: {
    TablaDashboard,
    MenuDashboard,
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
  