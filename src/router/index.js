import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Lazy-loaded components
const Home = () => import('@/pages/Home.vue');
const Login = () => import('@/pages/Login.vue');
const Register = () => import('@/pages/Register.vue');
const Profile = () => import('@/pages/Profile.vue');
const MovieDetail = () => import('@/pages/MovieDetail.vue');
const Recommendations = () => import('@/pages/Recommendations.vue');
const AdminDashboard = () => import('@/pages/AdminDashboard.vue');
const NotFound = () => import('@/pages/NotFound.vue');

// Navigation guards
function requireAuth(to, from, next) {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    next({ 
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
}

function requireAdmin(to, from, next) {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || authStore.userData?.role !== 'admin') {
    next({ path: '/' });
  } else {
    next();
  }
}

function redirectIfLoggedIn(to, from, next) {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    next({ path: '/' });
  } else {
    next();
  }
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: redirectIfLoggedIn
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    beforeEnter: redirectIfLoggedIn
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    beforeEnter: requireAuth
  },
  {
    path: '/movie/:id',
    name: 'movie-detail',
    component: MovieDetail,
    props: true
  },
  {
    path: '/recommendations',
    name: 'recommendations',
    component: Recommendations,
    beforeEnter: requireAuth
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    beforeEnter: requireAdmin
  },
  {
    // 404 Not Found
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Global navigation guard for auth state
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.checkLocalStorage();
  next();
});

export default router; 