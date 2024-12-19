<template>
    <div>
      <h2>Clientes</h2>
      <ul>
        <li v-for="cliente in clientes" :key="cliente.id">
          {{ cliente.nombre }} - {{ cliente.celular }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import api from '@/api/axios';
  
  export default {
    name: 'Clientes',
    data() {
      return {
        clientes: [],
      };
    },
    async created() {
      try {
        const response = await api.get('/clientes');
        this.clientes = response.data;
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    },
  };
  </script>
  