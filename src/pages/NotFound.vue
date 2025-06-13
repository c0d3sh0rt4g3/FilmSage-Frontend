<template>
  <div class="not-found-page">
    <!-- TV Static Background -->
    <div class="tv-static"></div>
    
    <!-- TV Noise Overlay -->
    <div class="tv-noise"></div>
    
    <!-- CRT Scanlines -->
    <div class="crt-scanlines"></div>
    
    <!-- TV Frame -->
    <div class="tv-frame">
      <!-- Screen Content -->
      <div class="tv-screen">
        <!-- Static interference bars -->
        <div class="interference-bars">
          <div class="bar" v-for="n in 8" :key="n"></div>
        </div>
        
        <!-- Main content -->
        <div class="content">
          <!-- Glitchy 404 -->
          <h1 class="error-code" ref="errorCode">
            <span class="glitch-text">404</span>
            <span class="glitch-layer glitch-red">404</span>
            <span class="glitch-layer glitch-blue">404</span>
            <span class="glitch-layer glitch-green">404</span>
          </h1>
          
          <!-- Error message with TV interference -->
          <div class="error-message">
            <h2 class="error-title">SIGNAL LOST</h2>
            <p class="error-description">
              Esta página se fue a ver una película y no volvió...
            </p>
            <p class="error-subtitle">Prueba con otra URL o vuelve al inicio</p>
          </div>
          
          <!-- TV Control Buttons -->
          <div class="tv-controls">
            <router-link to="/" class="tv-button">
              <span class="button-label">HOME</span>
              <div class="button-glow"></div>
            </router-link>
            <button @click="goBack" class="tv-button">
              <span class="button-label">BACK</span>
              <div class="button-glow"></div>
            </button>
          </div>
        </div>
        
        <!-- TV Test Pattern (appears occasionally) -->
        <div class="test-pattern" ref="testPattern">
          <div class="pattern-bars">
            <div class="color-bar red"></div>
            <div class="color-bar green"></div>
            <div class="color-bar blue"></div>
            <div class="color-bar yellow"></div>
            <div class="color-bar magenta"></div>
            <div class="color-bar cyan"></div>
            <div class="color-bar white"></div>
          </div>
        </div>
      </div>
      
      <!-- TV Brand Label -->
      <div class="tv-brand">FILMSAGE</div>
    </div>
    
    <!-- Vignette Effect -->
    <div class="vignette"></div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  data() {
    return {
      glitchInterval: null,
      staticInterval: null,
      testPatternInterval: null
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    
    startTVEffects() {
      // Random glitch effects
      this.glitchInterval = setInterval(() => {
        const errorCode = this.$refs.errorCode;
        if (errorCode) {
          errorCode.classList.add('glitch-active');
          setTimeout(() => {
            errorCode.classList.remove('glitch-active');
          }, 200);
        }
      }, Math.random() * 3000 + 1000);
      
      // Occasional test pattern
      this.testPatternInterval = setInterval(() => {
        const testPattern = this.$refs.testPattern;
        if (testPattern) {
          testPattern.classList.add('show');
          setTimeout(() => {
            testPattern.classList.remove('show');
          }, 500);
        }
      }, Math.random() * 10000 + 5000);
    }
  },
  
  mounted() {
    this.startTVEffects();
  },
  
  beforeUnmount() {
    if (this.glitchInterval) clearInterval(this.glitchInterval);
    if (this.staticInterval) clearInterval(this.staticInterval);
    if (this.testPatternInterval) clearInterval(this.testPatternInterval);
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables';

.not-found-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', monospace;
}

// TV Static Background
.tv-static {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    repeating-conic-gradient(#000 0deg, #111 1deg, #000 2deg),
    repeating-linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 2px, transparent 4px),
    repeating-linear-gradient(0deg, transparent, rgba(255,255,255,0.03) 2px, transparent 4px);
  animation: staticNoise 0.1s infinite steps(8);
  opacity: 0.8;
}

@keyframes staticNoise {
  0% { transform: translate(0px, 0px); }
  10% { transform: translate(-1px, 1px); }
  20% { transform: translate(1px, -1px); }
  30% { transform: translate(-1px, -1px); }
  40% { transform: translate(1px, 1px); }
  50% { transform: translate(-1px, 1px); }
  60% { transform: translate(1px, -1px); }
  70% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
  90% { transform: translate(-1px, 1px); }
  100% { transform: translate(0px, 0px); }
}

// TV Noise Overlay
.tv-noise {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 4px 4px;
  animation: noiseMove 0.2s infinite linear;
  opacity: 0.6;
}

@keyframes noiseMove {
  0% { background-position: 0px 0px; }
  25% { background-position: 2px 2px; }
  50% { background-position: 4px 0px; }
  75% { background-position: 2px 4px; }
  100% { background-position: 0px 0px; }
}

// CRT Scanlines
.crt-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 107, 107, 0.03) 2px,
    rgba(255, 107, 107, 0.03) 4px
  );
  animation: scanlineMove 0.1s infinite linear;
  pointer-events: none;
}

@keyframes scanlineMove {
  0% { transform: translateY(0px); }
  100% { transform: translateY(4px); }
}

// TV Frame
.tv-frame {
  position: relative;
  width: 90vw;
  max-width: 800px;
  height: 70vh;
  background: 
    linear-gradient(145deg, #2a2a2a, #1a1a1a),
    radial-gradient(ellipse at center, #333, #111);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 
    0 0 50px rgba(255, 107, 107, 0.2),
    inset 0 0 20px rgba(0, 0, 0, 0.5);
  border: 3px solid #444;
}

.tv-screen {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  border: 2px solid #222;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8);
}

// Interference Bars
.interference-bars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .bar {
    position: absolute;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    animation: interferenceMove 2s infinite linear;
    
    &:nth-child(1) { top: 10%; animation-delay: 0s; }
    &:nth-child(2) { top: 25%; animation-delay: 0.3s; }
    &:nth-child(3) { top: 40%; animation-delay: 0.6s; }
    &:nth-child(4) { top: 55%; animation-delay: 0.9s; }
    &:nth-child(5) { top: 70%; animation-delay: 1.2s; }
    &:nth-child(6) { top: 85%; animation-delay: 1.5s; }
    &:nth-child(7) { top: 15%; animation-delay: 1.8s; }
    &:nth-child(8) { top: 60%; animation-delay: 2.1s; }
  }
}

@keyframes interferenceMove {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}

// Main Content
.content {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #ff6b6b;
}

// Glitchy 404
.error-code {
  position: relative;
  font-size: clamp(4rem, 15vw, 8rem);
  font-weight: 900;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px #ff6b6b;
  
  .glitch-text {
    position: relative;
    z-index: 3;
    color: #ff6b6b;
  }
  
  .glitch-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    
    &.glitch-red {
      color: #ff0040;
      z-index: 1;
    }
    
    &.glitch-blue {
      color: #0080ff;
      z-index: 2;
    }
    
    &.glitch-green {
      color: #ffaa44;
      z-index: 1;
    }
  }
  
  &.glitch-active {
    .glitch-layer {
      opacity: 0.8;
      animation: glitchShift 0.2s ease-in-out;
    }
  }
}

@keyframes glitchShift {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

// Error Message
.error-message {
  margin-bottom: 3rem;
  
  .error-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    letter-spacing: 3px;
  }
  
  .error-description {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  }
  
  .error-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
  }
}

// TV Controls
.tv-controls {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tv-button {
  position: relative;
  padding: 1rem 2rem;
  background: 
    linear-gradient(145deg, #333, #111),
    radial-gradient(ellipse at center, #444, #222);
  border: 2px solid #555;
  border-radius: 8px;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  .button-label {
    position: relative;
    z-index: 2;
  }
  
  .button-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 6px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    border-color: #ff6b6b;
    box-shadow: 
      0 0 15px rgba(255, 107, 107, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    .button-glow {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 
      0 0 10px rgba(255, 107, 107, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

// Test Pattern
.test-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  &.show {
    opacity: 0.8;
  }
  
  .pattern-bars {
    display: flex;
    height: 100%;
    
    .color-bar {
      flex: 1;
      height: 100%;
      
      &.red { background: #ff0000; }
      &.green { background: #00ff00; }
      &.blue { background: #0000ff; }
      &.yellow { background: #ffff00; }
      &.magenta { background: #ff00ff; }
      &.cyan { background: #00ffff; }
      &.white { background: #ffffff; }
    }
  }
}

// TV Brand
.tv-brand {
  position: absolute;
  bottom: 10px;
  right: 20px;
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 2px;
}

// Vignette Effect
.vignette {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.7) 100%);
  pointer-events: none;
}

// Responsive Design - TV version for mobile
@media (max-width: 768px) {
  html, body {
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    height: auto;
  }
  
  .not-found-page {
    min-height: 100vh;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  // Resize TV frame for mobile
  .tv-frame {
    width: 95vw;
    max-width: 400px;
    height: 60vh;
    min-height: 500px;
    max-height: 600px;
  }
  
  .tv-screen {
    margin: 15px;
    border-radius: 8px;
  }
  
  // Mobile TV content
  .content {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  // Mobile 404 with glitch effects
  .error-code {
    font-size: clamp(2.5rem, 12vw, 4rem);
    margin-bottom: 1rem;
  }
  
  // Mobile error message
  .error-message {
    margin-bottom: 1.5rem;
    text-align: center;
    
    .error-title {
      font-size: clamp(1rem, 4vw, 1.4rem);
      margin-bottom: 0.8rem;
    }
    
    .error-description {
      font-size: clamp(0.8rem, 3vw, 1rem);
      margin-bottom: 0.4rem;
    }
    
    .error-subtitle {
      font-size: clamp(0.7rem, 2.5vw, 0.9rem);
    }
  }
  
  // Mobile TV controls
  .tv-controls {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    width: 100%;
    max-width: 200px;
  }
  
  .tv-button {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
    border-radius: 8px;
  }
  
  // Mobile TV brand
  .tv-brand {
    font-size: 0.6rem;
    bottom: 5px;
    right: 10px;
  }
}

// Light Mode Styles
@media (prefers-color-scheme: light) {
  .not-found-page {
    background: linear-gradient(135deg, #6a4c93 0%, #9b59b6 50%, #8e44ad 100%);
  }
  
  .tv-frame {
    background: 
      linear-gradient(145deg, #e8e8e8, #d0d0d0),
      radial-gradient(ellipse at center, #f0f0f0, #c0c0c0);
    border: 3px solid #bbb;
    box-shadow: 
      0 0 50px rgba(138, 43, 226, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.1);
  }
  
  .tv-screen {
    border: 2px solid #999;
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.2);
  }
  
  .tv-brand {
    color: #999;
  }
  
  .vignette {
    background: radial-gradient(ellipse at center, transparent 30%, rgba(106, 76, 147, 0.3) 100%);
  }
}

// Reduced Motion
@media (prefers-reduced-motion: reduce) {
  .tv-static,
  .tv-noise,
  .crt-scanlines,
  .interference-bars .bar {
    animation: none;
  }
  
  .error-code.glitch-active .glitch-layer {
    animation: none;
  }
}
</style> 