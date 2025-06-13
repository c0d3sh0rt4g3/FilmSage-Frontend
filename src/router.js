/**
 * Router configuration module for the application
 * @module router
 */

import Home from "@/pages/Home.vue";
import {createRouter, createWebHistory} from "vue-router";
import Search from "@/pages/Search.vue";
import CreateReview from "@/pages/CreateReview.vue";
import Profile from "@/pages/Profile.vue";
import MovieDetail from "@/pages/MovieDetail.vue";
import Recommendations from "@/pages/Recommendations.vue";
import AdminDashboard from "@/pages/AdminDashboard.vue";
import Favorites from "@/pages/Favorites.vue";
import NotFound from "@/pages/NotFound.vue";
import { useAuthStore } from '@/stores/authStore';
import { apiRequest } from '@/utils/api';

/**
 * Application routes configuration array
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const routes = [
    /**
     * Home page route
     * Directly imports the Home component for immediate loading
     * @type {import('vue-router').RouteRecordRaw}
     */
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/search',
        name: 'search',
        component: Search,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/review/create/:movieData',
        name: 'create-review',
        component: CreateReview,
        props: true,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/movie/:id',
        name: 'movie-detail',
        component: MovieDetail
    },
    {
        path: '/recommendations',
        name: 'recommendations',
        component: Recommendations,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/favorites',
        name: 'favorites',
        component: Favorites,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: {
            requiresAuth: true,
            requiresAdmin: true
        }
    },
    {
        // 404 Not Found - debe ir al final
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound
    }
]

/**
 * Creates and configures the Vue Router instance with HTML5 history mode
 * @type {import('vue-router').Router}
 */
const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard to check authentication and admin access
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Redirect to home if not authenticated
        next('/');
        return;
    }

    if (to.meta.requiresAdmin) {
        // Check if user is admin
        const [error, userData] = await apiRequest('/users/profile');
        if (error || !userData.is_admin) {
            next('/');
            return;
        }
    }

    next();
});

export default router;