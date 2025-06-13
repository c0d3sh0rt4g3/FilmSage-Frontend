/**
 * Vue Router configuration for FilmSage application
 * Handles routing, navigation guards, and lazy loading of components
 */
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

/**
 * Lazy-loaded components for better performance
 * Components are loaded only when needed
 */
const Home = () => import('@/pages/Home.vue');
const Profile = () => import('@/pages/Profile.vue');
const Search = () => import('@/pages/Search.vue');
const Favorites = () => import('@/pages/Favorites.vue');
const MovieDetail = () => import('@/pages/MovieDetail.vue');
const Recommendations = () => import('@/pages/Recommendations.vue');
const AdminDashboard = () => import('@/pages/AdminDashboard.vue');
const Reviews = () => import('@/pages/Reviews.vue');
const CreateReview = () => import('@/pages/CreateReview.vue');
const Contact = () => import('@/pages/Contact.vue');
const NotFound = () => import('@/pages/NotFound.vue');
const TestScroll = () => import('@/pages/TestScroll.vue');

/**
 * Navigation guard that requires user authentication
 * Redirects to login page if user is not authenticated
 * @param {object} to - Target route
 * @param {object} from - Current route
 * @param {function} next - Navigation callback
 */
function requireAuth(to, from, next) {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    // Redirect to home page since we use modals for login
    next({ path: '/' });
  } else {
    next();
  }
}

/**
 * Navigation guard that requires admin privileges
 * Redirects to home page if user is not admin
 * @param {object} to - Target route
 * @param {object} from - Current route
 * @param {function} next - Navigation callback
 */
function requireAdmin(to, from, next) {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || authStore.userData?.role !== 'admin') {
    next({ path: '/' });
  } else {
    next();
  }
}



/**
 * Application routes configuration
 * Defines all available routes with their components and guards
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },

  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    beforeEnter: requireAuth
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
    beforeEnter: requireAuth
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: Favorites,
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
    path: '/user/:userId/reviews',
    name: 'user-reviews',
    component: Reviews,
    props: true,
    beforeEnter: requireAuth
  },
  {
    path: '/review/create/:movieData',
    name: 'create-review',
    component: CreateReview,
    props: true,
    beforeEnter: requireAuth
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact
  },
  {
    path: '/test-scroll',
    name: 'test-scroll',
    component: TestScroll
  },
  {
    // 404 Not Found
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
];

/**
 * Create Vue Router instance with configuration
 * Sets up routing with web history and scroll behavior
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Temporarily disable scroll behavior to test if it's causing issues
    return false;
  }
});

/**
 * Global navigation guard to ensure authentication state is current
 * Checks localStorage for user data before each route navigation
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.checkLocalStorage();
  next();
});

export default router; 