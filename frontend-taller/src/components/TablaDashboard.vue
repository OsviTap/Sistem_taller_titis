<template>
    <div class="max-w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
      <!-- Busqueda por cliente o matricula -->
      <!-- <div class="mb-4 flex flex-col md:flex-row gap-4">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar por nombre o matrícula..."
          class="w-full md:w-1/2 p-2 border rounded-md focus:ring focus:ring-blue-300"
        />
        <button 
          @click="buscarCliente" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Buscar
        </button>
      </div> -->
  
      <!-- Tabla con resultados -->
      <div class="overflow-x-auto">
        <table id="search-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Placa</th>
              <th>Última Visita</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientes" :key="cliente.id">
              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.vehiculo }}</td>
              <td>{{ cliente.placa }}</td>
              <td>{{ cliente.ultimaVisita }}</td>
              <td class="flex justify-center">
                <button 
                  @click="abrirModal(cliente)"
                  class=" px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600">
                  Ver Detalle
                </button>
                <button 
                  @click="verHistorialCompleto(cliente)"
                  class="ml-2 px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600">
                  Ver Historial
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal para mostrar detalle rápido -->
      <div v-if="mostrarModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 class="text-lg font-semibold mb-4">Detalles de la Visita</h2>
          <p><strong>Cliente:</strong> {{ clienteSeleccionado.nombre }}</p>
          <p><strong>Vehículo:</strong> {{ clienteSeleccionado.vehiculo }}</p>
          <p><strong>Placa:</strong> {{ clienteSeleccionado.placa }}</p>
          <p><strong>Última Visita:</strong> {{ clienteSeleccionado.ultimaVisita }}</p>
          <p><strong>Servicios:</strong></p>
          <ul class="list-disc ml-6">
            <li v-for="servicio in clienteSeleccionado.servicios" :key="servicio.id">
              {{ servicio.nombre }} - {{ servicio.precio }} Bs.
            </li>
          </ul>
          <div class="flex justify-end mt-4">
            <button @click="cerrarModal" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  import { DataTable } from 'simple-datatables';
  
  export default {
    setup() {
      const searchQuery = ref('');
      const clientes = ref([]);
      const mostrarModal = ref(false);
      const clienteSeleccionado = ref(null);
  
      // Datos simulados
      clientes.value = [
        { id: 1, nombre: 'Juan Pérez', vehiculo: 'Toyota Corolla', placa: 'ABC-123', ultimaVisita: '2023-12-15', servicios: [{ id: 1, nombre: 'Cambio de aceite', precio: 100 }] },
        { id: 2, nombre: 'Ana Gómez', vehiculo: 'Nissan Versa', placa: 'XYZ-789', ultimaVisita: '2023-12-10', servicios: [{ id: 2, nombre: 'Alineación', precio: 80 }] }
      ];
  
      const buscarCliente = () => {
        // Lógica para filtrar clientes según el valor en searchQuery
        console.log('Buscar:', searchQuery.value);
      };
  
      const abrirModal = (cliente) => {
        clienteSeleccionado.value = cliente;
        mostrarModal.value = true;
      };
  
      const cerrarModal = () => {
        mostrarModal.value = false;
      };
  
      const verHistorialCompleto = (cliente) => {
        console.log('Ir al historial completo de:', cliente.nombre);
        // Aquí iría la redirección a otra vista
      };
  
      onMounted(() => {
        const dataTable = new DataTable('#search-table', {
          searchable: true,
          sortable: true,
          perPage: 10
        });
      });
  
      return {
        searchQuery,
        clientes,
        mostrarModal,
        clienteSeleccionado,
        buscarCliente,
        abrirModal,
        cerrarModal,
        verHistorialCompleto
      };
    }
  };
  </script>
  
  <style scoped>
  .datatable-input {
    @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
  }
  </style>
  