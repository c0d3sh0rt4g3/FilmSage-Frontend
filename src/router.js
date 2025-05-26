/**
 * Router configuration module for the application
 * @module router
 */

import Home from "@/pages/Home.vue";
import {createRouter, createWebHistory} from "vue-router";
import Search from "@/pages/Search.vue";

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
        component: Home
    },
    {
        path: '/search',
        component: Search
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

export default router;