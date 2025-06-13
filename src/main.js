/**
 * Main application entry point
 * Initializes the Vue application with routing, state management, and theming
 */
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import {createPinia} from "pinia";

/**
 * Initialize Pinia store for state management
 */
const pinia = createPinia()

/**
 * Initialize theme on application start
 * Applies the saved theme from localStorage or defaults to light theme
 */
const savedTheme = localStorage.getItem('theme') || 'light' // Default to light (current purple theme)
document.documentElement.classList.add(`${savedTheme}-theme`)

/**
 * Create and mount the Vue application
 */
createApp(App).use(router).use(pinia).mount('#app')
