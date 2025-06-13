import { ref, computed, onMounted } from 'vue'

// Global theme state
const isDark = ref(false)

export function useTheme() {
  const theme = computed(() => isDark.value ? 'dark' : 'light')
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateHTMLClass()
    saveToStorage()
  }
  
  const setTheme = (newTheme) => {
    isDark.value = newTheme === 'dark'
    updateHTMLClass()
    saveToStorage()
  }
  
  const updateHTMLClass = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark-theme')
      html.classList.remove('light-theme')
    } else {
      html.classList.add('light-theme')
      html.classList.remove('dark-theme')
    }
  }
  
  const saveToStorage = () => {
    localStorage.setItem('theme', theme.value)
  }
  
  const loadFromStorage = () => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // Default to light mode (current styling)
      isDark.value = false
    }
    updateHTMLClass()
  }
  
  // Initialize theme on first use
  onMounted(() => {
    loadFromStorage()
  })
  
  return {
    isDark: computed(() => isDark.value),
    theme,
    toggleTheme,
    setTheme,
    loadFromStorage
  }
} 