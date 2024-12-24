<script>

</script>
<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
    
    <!-- Tabla -->
    <table id="filter-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Dirección</th>
          <th scope="col" class="px-6 py-3">Teléfono</th>
          <th scope="col" class="px-6 py-3">Status</th>
          <th scope="col" class="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientes" :key="cliente.nombre" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {{ cliente.nombre }}
          </td>
          <td class="px-6 py-4">{{ cliente.direccion }}</td>
          <td class="px-6 py-4">{{ cliente.telefono }}</td>
          <td class="px-6 py-4">
            <span :class="{
              'px-2 py-1 rounded text-xs font-medium': true,
              'bg-green-100 text-green-800': cliente.status === 'In Stock',
              'bg-red-100 text-red-800': cliente.status === 'Out of Stock'
            }">
              {{ cliente.status }}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center space-x-2">
              <button @click="openViewModal(cliente)" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              <button @click="openEditModal(cliente)" class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
              <button @click="deletecliente(cliente)" class="font-medium text-red-600 dark:text-red-500 hover:underline">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
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
  const clientes = [
    {
      nombre: 'Apple iMac',
      telefono: 'Computers',
      direccion: 'Apple',
      status: 'In Stock'
    },
    // ... más clienteos
  ];
  
  onMounted(() => {
    if (document.getElementById("filter-table")) {
      const dataTable = new DataTable("#filter-table",  {
        labels: {
        perPage: "clientes por página",
        placeholder: "Buscar cliente...",
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