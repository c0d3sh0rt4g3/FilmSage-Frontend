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

/* Remove the padding-top since header is now initially static */
.router-view {
  /* padding-top removed */
}
</style>