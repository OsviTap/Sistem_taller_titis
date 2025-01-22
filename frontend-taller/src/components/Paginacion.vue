<template>
  <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="$emit('cambiarPagina', currentPage - 1)"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Anterior
      </button>
      <button
        @click="$emit('cambiarPagina', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Mostrando
          <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span>
          a
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
          de
          <span class="font-medium">{{ totalItems }}</span>
          resultados
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Botón Anterior -->
          <button
            @click="$emit('cambiarPagina', currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <span class="sr-only">Anterior</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Primera página -->
          <button
            v-if="currentPage > 3"
            @click="$emit('cambiarPagina', 1)"
            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            1
          </button>

          <!-- Elipsis inicial -->
          <span
            v-if="currentPage > 4"
            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            ...
          </span>

          <!-- Páginas -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="$emit('cambiarPagina', page)"
            :class="[
              page === currentPage 
                ? 'bg-indigo-600 text-white focus-visible:outline-indigo-600'
                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold'
            ]"
          >
            {{ page }}
          </button>

          <!-- Elipsis final -->
          <span
            v-if="currentPage < totalPages - 3"
            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            ...
          </span>

          <!-- Última página -->
          <button
            v-if="currentPage < totalPages - 2"
            @click="$emit('cambiarPagina', totalPages)"
            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            {{ totalPages }}
          </button>

          <!-- Botón Siguiente -->
          <button
            @click="$emit('cambiarPagina', currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <span class="sr-only">Siguiente</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
});

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

// Calcula las páginas visibles (máximo 5 páginas)
const visiblePages = computed(() => {
  const pages = [];
  let start = Math.max(1, props.currentPage - 2);
  let end = Math.min(totalPages.value, start + 4);
  
  // Ajustar el inicio si estamos cerca del final
  if (end === totalPages.value) {
    start = Math.max(1, end - 4);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

defineEmits(['cambiarPagina']);
</script> 