<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
    <!-- Tabla -->
    <table id="filter-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">ID</th>
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Stock</th>
          <th scope="col" class="px-6 py-3">Precio Costo</th>
          <th scope="col" class="px-6 py-3">Precio Venta</th>
          <th scope="col" class="px-6 py-3">Fecha Adquisición</th>
          <th scope="col" class="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productos" :key="producto.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ producto.id }}</td>
          <td class="px-6 py-4">{{ producto.nombre }}</td>
          <td class="px-6 py-4">{{ producto.stock }}</td>
          <td class="px-6 py-4">{{ producto.precioCosto }}</td>
          <td class="px-6 py-4">{{ producto.precioVenta }}</td>
          <td class="px-6 py-4">{{ producto.fechaAdquisicion }}</td>
          <td class="px-6 py-4">
            <div class="flex items-center space-x-2">
              <button @click="openViewModal(producto)" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                Ver
              </button>
              <button @click="openEditModal(producto)" class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">
                Editar
              </button>
              <button @click="deleteProducto(producto)" class="font-medium text-red-600 dark:text-red-500 hover:underline">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { DataTable } from 'simple-datatables';

const productos = [
  {
    id: 1,
    nombre: 'Producto A',
    stock: 100,
    precioCosto: 50,
    precioVenta: 75,
    fechaAdquisicion: '2023-01-01'
  },
  // ... más productos
];

onMounted(() => {
  if (document.getElementById("filter-table")) {
    const dataTable = new DataTable("#filter-table", {
      labels: {
        perPage: "productos por página",
        placeholder: "Buscar producto...",
      },
      tableRender: (_data, table, type) => {
        if (type === "print") {
          return table;
        }
        const tHead = table.childNodes[0];
        const filterHeaders = {
          nodeName: "TR",
          attributes: {
            class: "search-filtering-row"
          },
          childNodes: tHead.childNodes[0].childNodes.map(
            (_th, index) => ({
              nodeName: "TH",
              childNodes: [
                {
                  nodeName: "INPUT",
                  attributes: {
                    class: "datatable-input",
                    type: "search",
                    "data-columns": "[" + index + "]"
                  }
                }
              ]
            })
          )
        };
        tHead.childNodes.push(filterHeaders);
        return table;
      }
    });
  }
});
</script>

<style scoped>
.datatable-input {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>