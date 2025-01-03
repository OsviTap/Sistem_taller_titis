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
      meta: { requiresAuth: true },
    },
    {
      path: '/', 
      redirect: '/login', 
    },
    {
      path: '/login',
      name: 'login', 
      component: LoginView, 
      meta: { requiresAuth: false },
    },

    {path: '/clientes', name: 'clientes', 
      component: () => import('../views/ClientesView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/productos', name: 'productos',
      component: () => import('../views/ProductosView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/servicios', name: 'servicios',
      component: () => import('../views/ServiciosView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/marca', name: 'marca',
      component: () => import('../views/MarcaView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/modelo', name: 'modelo',
      component: () => import('../views/ModeloView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/usuarios', name: 'usuarios',
      component: () => import('../views/UsuariosView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/visitas', name: 'visitas',
      component: () => import('../views/VisitasView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/historial', name: 'historial',
      component: () => import('../views/HistorialView.vue'),
      meta: { requiresAuth: true },
    },
    {path: '/historial-productos', name: 'ProductHistory',
        component: () => import('@/views/HistorialProductosView.vue'),
        meta: { requiresAuth: true },
      },
    
  ],
})
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('user')); // Suponiendo que el objeto se guarda bajo la clave 'user'
  const userRole = userData ? userData.rol : null;
  
  // Si la ruta requiere autenticación y no hay token
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }
  // Si el usuario es empleado y trata de acceder a la vista de usuarios
  if (userRole === 'empleado' && to.name === 'usuarios') {
    next('/dashboard'); // Redirigir a dashboard
    return;
  }

  // Si vamos al login y ya estamos autenticados
  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Si vamos a la ruta raíz y estamos autenticados
  if (to.path === '/' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  next();
});

export default router;
