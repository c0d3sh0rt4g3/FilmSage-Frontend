<template>
  <div class="test-page">
    <div class="test-header">INICIO DE LA PÁGINA</div>
    
    <div class="test-section" v-for="n in 20" :key="n">
      <h2>Sección {{ n }}</h2>
      <p>Esta es la sección número {{ n }}. Si puedes ver todas las 20 secciones, el scroll funciona correctamente.</p>
    </div>
    
    <div class="test-footer">
      <h2 style="color: red; border: 3px solid red; padding: 20px; background: yellow;">
        FIN DE LA PÁGINA - SECCIÓN 20
      </h2>
      <p style="color: red; font-weight: bold; font-size: 18px;">
        Si puedes ver este texto completamente, el scroll funciona correctamente.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestScroll'
}
</script>

<style scoped>
.test-page {
  padding: 2rem;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
  min-height: 200vh; /* Forzar altura mínima de 2 viewports */
}

.test-header {
  background: green;
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 2rem;
}

.test-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.test-section h2 {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.test-footer {
  background: rgba(255, 0, 0, 0.2);
  padding: 3rem;
  text-align: center;
  border: 3px solid red;
  margin-top: 2rem;
}

/* Force scroll in mobile */
@media (max-width: 768px) {
  .test-page {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    min-height: 300vh !important; /* Forzar altura aún mayor en mobile */
  }
}
</style> 