<template>
  <div>
    <h1>Sistema de Taller</h1>
    <button @click="probarAPI">Probar API</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import apiClient from '@/api/axios.js';

export default {
    data() {
        return {
            message: '',
        };
    },
    methods: {
        async probarAPI() {
            try {
                const response = await apiClient.get('/');
                this.message = response.data;
            } catch (error) {
                console.error(error);
            }
        },
    },
};
</script>
