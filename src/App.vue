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
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view/>
    </main>
  </div>
</template>

<style>
html, body {
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
}
</style>