<template>
  <button class="theme-toggle" @click="toggleTheme" :class="{ 'active': isDark }">
    <div class="toggle-track">
      <div class="toggle-thumb">
        <!-- Light mode icon (light_mode) -->
        <span class="material-icons icon light-icon" :class="{ 'visible': !isDark }">
          light_mode
        </span>
        
        <!-- Dark mode icon (dark_mode) -->
        <span class="material-icons icon dark-icon" :class="{ 'visible': isDark }">
          dark_mode
        </span>
      </div>
    </div>
  </button>
</template>

<script>
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'ThemeToggle',
  setup() {
    const { isDark, toggleTheme } = useTheme()
    
    return {
      isDark,
      toggleTheme
    }
  }
}
</script>

<style lang="scss" scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  outline: none;
  
  .toggle-track {
    width: 60px;
    height: 30px;
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    border-radius: 15px;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    
    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      
      .icon {
        position: absolute;
        font-size: 16px;
        transition: all 0.3s ease;
        opacity: 0;
        transform: scale(0.5) rotate(180deg);
        
        &.visible {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        
        &.light-icon {
          color: #ff6b6b;
        }
        
        &.dark-icon {
          color: #2c2c2c;
        }
      }
    }
  }
  
  &.active {
    .toggle-track {
      background: linear-gradient(45deg, #2c2c2c, #1a1a1a);
      
      .toggle-thumb {
        transform: translateX(30px);
        background: #f0f0f0;
      }
    }
  }
  
  &:hover {
    .toggle-track {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
  }
  
  &:active {
    .toggle-track {
      transform: scale(0.95);
    }
  }
}
</style> 