<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 class="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        <form @submit.prevent="login">
          <div class="mb-5">
            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo:</label>
            <input type="email" v-model="email" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div class="mb-5">
            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña:</label>
            <input type="password" v-model="password" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div class="flex items-start mb-5">
            <div class="flex items-center h-5">
              <input id="remember" type="checkbox" value="" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required />
            </div>
            <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Recordar contraseña</label>
          </div>
          <div class="text-center">
            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Ingresar
            </button>
          </div>
          
        </form>
        <p v-if="error" class="mt-4 text-red-500 text-sm text-center">{{ error }}</p>
      </div>
    </div>
</template>
  
  <script>
  // import api from '@/api/axios';
  
  
  export default {
    name: 'Login',
    data() {
      return {
        email: '',
        password: '',
        error: null,
      };
    },}
  //   methods: {
  //     async login() {
  //       try {
  //         const response = await api.post('/login', {
  //           email: this.email,
  //           password: this.password,
  //         });
  //         localStorage.setItem('token', response.data.token);
  //         this.$router.push('/dashboard');
  //       } catch (error) {
  //         this.error = 'Credenciales incorrectas';
  //       }
  //     },
  //   },
  // };
  </script>
  