/**
 * Router configuration module for the application
 * @module router
 */

import Home from "@/pages/Home.vue";
import {createRouter, createWebHistory} from "vue-router";
import Search from "@/pages/Search.vue";
import CreateReview from "@/pages/CreateReview.vue";
import { useAuthStore } from '@/stores/authStore';

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

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) {
            // Redirect to home if not authenticated
            next('/');
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;