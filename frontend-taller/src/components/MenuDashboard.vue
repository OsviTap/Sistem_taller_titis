<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h5 class="text-lg font-semibold text-gray-900 dark:text-white">Período</h5>
      <select 
        v-model="periodoSeleccionado"
        class="w-full sm:w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="day">Hoy</option>
        <option value="week">Esta Semana</option>
        <option value="month">Este Mes</option>
        <option value="year">Este Año</option>
      </select>
    </div>
    
    <div id="salesDonutChart" class="w-full"></div>
    
    <div class="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
        Actualizado: {{ formatDate(lastUpdate) }}
      </p>
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