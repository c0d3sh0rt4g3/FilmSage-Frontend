import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router.js";
import {createPinia} from "pinia";

const pinia = createPinia()

// Initialize theme on app start
const savedTheme = localStorage.getItem('theme') || 'light' // Default to light (current purple theme)
document.documentElement.classList.add(`${savedTheme}-theme`)

createApp(App).use(router).use(pinia).mount('#app')
