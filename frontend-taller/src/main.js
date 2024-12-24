import './assets/main.css'
//import 'simple-datatables/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'flowbite';
import 'apexcharts';

const app = createApp(App)

app.use(router)

app.mount('#app')

// Inicializar el tema al cargar la aplicación
if (localStorage.getItem('color-theme') === 'dark' || (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}