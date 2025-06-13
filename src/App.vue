<script>
import Header from '@/components/Header.vue';

export default {
  name: 'App',
  components: {
    Header
  }
};
</script>

<template>
  <Header />
  <router-view/>
</template>

<style>
html, body {
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
}

/* Header is always fixed now */
.router-view {
  padding-top: 120px; /* Space for fixed header */
}

@media (max-width: 768px) {
  .router-view {
    padding-top: 200px; /* More space for mobile vertical layout */
  }
}
</style>