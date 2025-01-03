<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white p-4">
        Productos con Stock Bajo
      </h3>
      <div v-if="productosStockBajo.length > 0">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">Nombre</th>
              <th scope="col" class="px-6 py-3">Stock</th>
              <th scope="col" class="px-6 py-3">Precio Venta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosStockBajo" 
                :key="producto.id" 
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-6 py-4">{{ producto.nombre }}</td>
              <td class="px-6 py-4">
                <span class="text-red-600 font-medium">{{ producto.stock }}</span>
              </td>
              <td class="px-6 py-4">{{ producto.precioVenta }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-4 text-center text-gray-500 dark:text-gray-400">
        No hay productos con stock bajo
      </div>
    </div>
</template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import axios from '@/api/axios';
  import { io } from 'socket.io-client';
  
  const productosStockBajo = ref([]);
  const socket = io('http://localhost:3001');
  
  const cargarProductosStockBajo = async () => {
    try {
      const response = await axios.get('/productos');
      productosStockBajo.value = response.data.filter(producto => producto.stock < 5);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };
  
  onMounted(() => {
    cargarProductosStockBajo();
    
    socket.on('stockUpdated', () => {
      cargarProductosStockBajo();
    });
  });
  
  onUnmounted(() => {
    socket.off('stockUpdated');
    socket.disconnect();
  });
  </script>