import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../App.vue'
import LoginView from '@/views/LoginView.vue';



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'home',
      component:() => import('../views/DashboardView.vue'),
    },
    {
      path: '/', redirect: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {path: '/login', component: LoginView },
    {path: '/clientes', name: 'clientes', 
      component: () => import('../views/ClientesView.vue'),},
    {path: '/productos', name: 'productos',
      component: () => import('../views/ProductosView.vue'),},
    {path: '/servicios', name: 'servicios',
      component: () => import('../views/ServiciosView.vue'),},
    {path: '/marca', name: 'marca',
      component: () => import('../views/MarcaView.vue'),},
    {path: '/modelo', name: 'modelo',
      component: () => import('../views/ModeloView.vue'),},
    {path: '/usuarios', name: 'usuarios',
      component: () => import('../views/UsuariosView.vue'),},
    {path: '/visitas', name: 'visitas',
      component: () => import('../views/VisitasView.vue'),},
    {path: '/historial', name: 'historial',
      component: () => import('../views/HistorialView.vue'),},
    {path: '/historial-productos', name: 'ProductHistory',
        component: () => import('@/views/HistorialProductosView.vue'),
      },
    
  ],
})

export default router
