<template>
    <div class="py-8 px-4 mx-auto max-w-screen-2xl lg:px-6">
      <div class="relative bg-white dark:bg-gray-800 sm:rounded-lg overflow-hidden">
        <!-- Título y botones de acción -->
        <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
          <div class="w-full md:w-1/2">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Modelo
            </h2>
          </div>
          <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
            <button type="button" class="flex items-center justify-center text-gray-900 bg-primary-700 hover:bg-primary-800 hover:bg-gray-200 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
              <svg class="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              Registrar Modelo
            </button>
          </div>
        </div>
        
        <!-- Tabla de Modelo -->
        <TablaModelo />
      </div>
    </div>
  </template>
  
  <script setup>
  import TablaModelo from '@/components/TablaModelo.vue';
  </script>
    