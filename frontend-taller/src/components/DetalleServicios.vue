<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">Detalle de Servicios</h2>

    <div class="mb-4">
      <label for="servicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Servicio</label>
      <select v-model="servicioSeleccionado" id="servicio" class="input-select">
        <option v-for="servicio in servicios" :key="servicio.id" :value="servicio">
          {{ servicio.nombre }} - Bs {{ servicio.precio }}
        </option>
      </select>
      <button type="button" @click="agregarServicio" class="btn-primary mt-2">Agregar Servicio</button>
    </div>

    <!-- Lista de Servicios -->
    <table class="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Servicio</th>
          <th scope="col" class="px-6 py-3">Precio (Bs)</th>
          <th scope="col" class="px-6 py-3">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(detalle, index) in detalles" :key="index" class="bg-white dark:bg-gray-800">
          <td class="px-6 py-4">{{ detalle.nombre }}</td>
          <td class="px-6 py-4">Bs {{ detalle.precio }}</td>
          <td class="px-6 py-4">
            <button @click="eliminarDetalle(index)" class="btn-danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const servicios = ref([
  { id: 1, nombre: 'Cambio de aceite', precio: 150 },
  { id: 2, nombre: 'Alineación y balanceo', precio: 100 },
  // ... más servicios
]);

const servicioSeleccionado = ref(null);
const detalles = ref([]);

// Watch para actualizar el total en el componente padre
watch(detalles, (newValue) => {
  emit('update:modelValue', newValue);
});

function agregarServicio() {
  if (servicioSeleccionado.value) {
    detalles.value.push(servicioSeleccionado.value);
    servicioSeleccionado.value = null; // Reiniciar selección
  }
}

function eliminarDetalle(index) {
  detalles.value.splice(index, 1);
}

const total = computed(() => {
  const totalServicios = detalles.value.reduce((sum, item) => sum + item.precio, 0);
  const totalProductos = detallesProductos.value.reduce((sum, item) => sum + item.precio, 0);
  console.log('Total Servicios:', totalServicios);
  console.log('Total Productos:', totalProductos);
  return totalServicios + totalProductos;
});
</script>

<style scoped>
.input-select, .input-text {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
}
.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700;
}
</style> 