<template>
    <div class="p-6">
      <!-- Header -->
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Registro de Visita</h1>
  
      <!-- Formulario -->
      <form @submit.prevent="guardarVisita">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Cliente -->
          <div>
            <label for="cliente" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
            <select v-model="clienteSeleccionado" id="cliente" class="input-select">
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                {{ cliente.nombre }}
              </option>
            </select>
          </div>
  
          <!-- Vehículo -->
          <div>
            <label for="vehiculo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehículo</label>
            <select v-model="vehiculoSeleccionado" id="vehiculo" class="input-select">
              <option v-for="vehiculo in vehiculosFiltrados" :key="vehiculo.id" :value="vehiculo.id">
                {{ vehiculo.modelo }} - {{ vehiculo.placa }}
              </option>
            </select>
          </div>
  
          <!-- Fecha -->
          <div>
            <label for="fecha" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
            <input type="date" id="fecha" v-model="fechaActual" class="input-text" disabled />
          </div>
  
          <!-- Kilometraje Actual -->
          <div>
            <label for="kilometraje" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kilometraje Actual</label>
            <input type="number" id="kilometraje" v-model.number="kilometraje" class="input-text" />
          </div>
  
          <!-- Próximo Cambio -->
          <div>
            <label for="proximo-cambio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Próximo Cambio (Km)</label>
            <input type="number" id="proximo-cambio" v-model.number="proximoCambio" class="input-text" />
          </div>
        </div>
  
        <!-- Sección de Detalles -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Detalles de la Visita</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Selector de Servicios -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3">Agregar Servicio</h3>
              <div class="space-y-3">
                <select v-model="servicioSeleccionado" id="servicio" class="input-select">
                  <option value="">Seleccione un servicio</option>
                  <option v-for="servicio in servicios" :key="servicio.id" :value="servicio">
                    {{ servicio.nombre }} - Bs {{ servicio.precio }}
                  </option>
                </select>
                <button type="button" @click="agregarServicio" 
                        class="btn-primary w-full">
                  Agregar Servicio
                </button>
              </div>
            </div>
  
            <!-- Selector de Productos -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3">Agregar Producto</h3>
              <div class="space-y-3">
                <select v-model="productoSeleccionado" id="producto" class="input-select">
                  <option value="">Seleccione un producto</option>
                  <option v-for="producto in productos" :key="producto.id" :value="producto">
                    {{ producto.nombre }} - Bs {{ producto.precio }}
                  </option>
                </select>
                <button type="button" @click="agregarProducto" 
                        class="btn-primary w-full">
                  Agregar Producto
                </button>
              </div>
            </div>
          </div>
  
          <!-- Lista Unificada de Detalles -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <table class="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" class="px-6 py-3">Tipo</th>
                  <th scope="col" class="px-6 py-3">Descripción</th>
                  <th scope="col" class="px-6 py-3">Precio (Bs)</th>
                  <th scope="col" class="px-6 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detalle, index) in detallesUnificados" 
                    :key="index" 
                    class="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td class="px-6 py-4">
                    <span :class="{
                      'px-2 py-1 rounded text-xs font-medium': true,
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': detalle.tipo === 'Servicio',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': detalle.tipo === 'Producto'
                    }">
                      {{ detalle.tipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4">{{ detalle.nombre }}</td>
                  <td class="px-6 py-4">Bs {{ detalle.precio }}</td>
                  <td class="px-6 py-4">
                    <button @click="eliminarDetalle(index, detalle.tipo)" 
                            class="btn-danger">
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="detallesUnificados.length === 0" 
                    class="bg-white dark:bg-gray-800">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay items agregados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Total -->
          <div class="flex justify-end mt-6">
            <p class="text-lg font-semibold text-gray-800 dark:text-white">
              Total: Bs {{ totalGeneral }}
            </p>
          </div>
        </div>
  
        <!-- Botones -->
        <div class="flex justify-end gap-4 mt-6">
          <button type="button" @click="generarDocumento" class="btn-secondary">Imprimir</button>
          <button type="submit" class="btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  
  const clientes = ref([]);
  const vehiculos = ref([]);
  const servicios = ref([]);
  const productos = ref([]);
  const detalleServicios = ref([]);
  const detalleProductos = ref([]);
  
  const clienteSeleccionado = ref(null);
  const vehiculoSeleccionado = ref(null);
  const servicioSeleccionado = ref(null);
  const productoSeleccionado = ref(null);
  
  const fechaActual = ref(new Date().toISOString().split('T')[0]);
  const kilometraje = ref(0);
  const proximoCambio = ref(0);
  
  const detallesUnificados = computed(() => {
    const servicios = detalleServicios.value.map(servicio => ({
      ...servicio,
      tipo: 'Servicio'
    }));
    const productos = detalleProductos.value.map(producto => ({
      ...producto,
      tipo: 'Producto'
    }));
    return [...servicios, ...productos];
  });
  
  const totalGeneral = computed(() => 
    detallesUnificados.value.reduce((sum, item) => sum + item.precio, 0)
  );
  
  const vehiculosFiltrados = computed(() => {
    return vehiculos.value.filter(vehiculo => vehiculo.clienteId === clienteSeleccionado.value);
  });
  
  function agregarServicio() {
    if (servicioSeleccionado.value) {
      detalleServicios.value.push(servicioSeleccionado.value);
      servicioSeleccionado.value = null;
    }
  }
  
  function agregarProducto() {
    if (productoSeleccionado.value) {
      detalleProductos.value.push(productoSeleccionado.value);
      productoSeleccionado.value = null;
    }
  }
  
  function eliminarDetalle(index, tipo) {
    const serviciosLength = detalleServicios.value.length;
    if (tipo === 'Servicio') {
      detalleServicios.value.splice(index, 1);
    } else {
      detalleProductos.value.splice(index - serviciosLength, 1);
    }
  }
  
  function guardarVisita() {
    console.log('Datos guardados:', {
      clienteSeleccionado,
      vehiculoSeleccionado,
      fechaActual,
      kilometraje,
      proximoCambio,
      detalleServicios,
      detalleProductos,
      totalGeneral: totalGeneral.value
    });
  }
  
  function generarDocumento() {
    window.print();
  }
  
  onMounted(() => {
    // Cargar datos simulados
    clientes.value = [
      { id: 1, nombre: 'Juan Perez' },
      { id: 2, nombre: 'Maria Lopez' }
    ];
    vehiculos.value = [
      { id: 1, clienteId: 1, modelo: 'Toyota Corolla', placa: 'ABC123' },
      { id: 2, clienteId: 1, modelo: 'Honda Civic', placa: 'XYZ456' }
    ];
    servicios.value = [
      { id: 1, nombre: 'Cambio de aceite', precio: 150 },
      { id: 2, nombre: 'Alineación y balanceo', precio: 100 }
    ];
    productos.value = [
      { id: 1, nombre: 'Aceite Motor 5W-30', precio: 200 },
      { id: 2, nombre: 'Filtro de aceite', precio: 50 }
    ];
  });
  </script>
  
  <style scoped>
  .input-select, .input-text {
    @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
  }
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
  }
  .btn-secondary {
    @apply px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700;
  }
  .btn-danger {
    @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700;
  }
  </style>