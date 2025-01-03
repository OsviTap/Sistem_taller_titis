<template>
  <div class="max-w-sm w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
    <div class="flex justify-between items-center mb-4">
      <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Resumen de Ventas</h5>
      <select 
        v-model="periodoSeleccionado"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="day">Hoy</option>
        <option value="week">Esta Semana</option>
        <option value="month">Este Mes</option>
        <option value="year">Este Año</option>
      </select>
    </div>
    
    <div id="salesDonutChart"></div>
    
    <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-5 pt-5">
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {{ formatDate(lastUpdate) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import axios from '@/api/axios';
import ApexCharts from 'apexcharts';

const periodoSeleccionado = ref('month');
const lastUpdate = ref(new Date());
let chart = null;

const obtenerDatos = async () => {
  try {
    const response = await axios.get('/historial-productos/totales', {
      params: { periodo: periodoSeleccionado.value }
    });
    
    const { totalVendido, totalCosto, totalDescuento, gananciaTotal } = response.data;
    
    const series = [totalVendido, totalCosto, totalDescuento, gananciaTotal];
    updateChart(series);
    lastUpdate.value = new Date();
  } catch (error) {
    console.error('Error al obtener datos:', error);
  }
};

const initChart = () => {
  const options = {
    series: [0, 0, 0, 0],
    chart: {
      type: 'donut',
      height: 380
    },
    labels: ['Total Vendido', 'Total Costo', 'Total Descuento', 'Ganancia Total'],
    colors: ['#22c55e', '#ef4444', '#eab308', '#3b82f6'],
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString('es-BO', {
                  style: 'currency',
                  currency: 'BOB'
                });
              }
            }
          }
        }
      }
    }
  };

  chart = new ApexCharts(document.querySelector("#salesDonutChart"), options);
  chart.render();
};

const updateChart = (newSeries) => {
  if (chart) {
    chart.updateSeries(newSeries);
  }
};

const formatDate = (date) => {
  return date.toLocaleString('es-BO');
};

watch(periodoSeleccionado, () => {
  obtenerDatos();
});

onMounted(() => {
  initChart();
  obtenerDatos();
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>