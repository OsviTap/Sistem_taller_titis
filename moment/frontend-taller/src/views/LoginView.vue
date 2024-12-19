<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 class="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        <form @submit.prevent="login">
          <label for="email" class="block text-sm font-medium text-gray-700">Correo:</label>
          <input type="email" v-model="email" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          <label for="password" class="block text-sm font-medium text-gray-700 mt-4">Contraseña:</label>
          <input type="password" v-model="password" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          <button type="submit" class="mt-6 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Ingresar</button>
        </form>
        <p v-if="error" class="mt-4 text-red-500 text-sm text-center">{{ error }}</p>
      </div>
    </div>
</template>
  
  <script>
  import api from '@/api/axios';
  
  
  export default {
    name: 'Login',
    data() {
      return {
        email: '',
        password: '',
        error: null,
      };
    },
    methods: {
      async login() {
        try {
          const response = await api.post('/login', {
            email: this.email,
            password: this.password,
          });
          localStorage.setItem('token', response.data.token);
          this.$router.push('/dashboard');
        } catch (error) {
          this.error = 'Credenciales incorrectas';
        }
      },
    },
  };
  </script>
  