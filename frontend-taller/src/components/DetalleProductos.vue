<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4">Detalle de Productos</h2>

    <div class="mb-4">
      <label for="producto" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
      <select v-model="productoSeleccionado" id="producto" class="input-select">
        <option v-for="producto in productos" :key="producto.id" :value="producto">
          {{ producto.nombre }} - Bs {{ producto.precio }}
        </option>
      </select>
      <button type="button" @click="agregarProducto" class="btn-primary mt-2">Agregar Producto</button>
    </div>

    <!-- Lista de Productos -->
    <table class="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Producto</th>
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
import { ref, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const productos = ref([
  { id: 1, nombre: 'Producto A', precio: 100 },
  { id: 2, nombre: 'Producto B', precio: 150 },
  // ... más productos
]);

const productoSeleccionado = ref(null);
const detalles = ref([]);

// Watch para actualizar el total en el componente padre
watch(detalles, (newValue) => {
  emit('update:modelValue', newValue);
});

function agregarProducto() {
  if (productoSeleccionado.value) {
    detalles.value.push(productoSeleccionado.value);
    productoSeleccionado.value = null; // Reiniciar selección
  }
}

function eliminarDetalle(index) {
  detalles.value.splice(index, 1);
}
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