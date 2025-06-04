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

/* Add padding for the fixed header */
.router-view {
  padding-top: 80px;
}
</style>