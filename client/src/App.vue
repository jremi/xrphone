<template>
  <div id="app">
    <NavBar />
    <div class="main-layout">
      <router-view></router-view>
    </div>
    <Footer v-if="$route.name === 'landing'" />
  </div>
</template>

<script>
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

export default {
  name: "App",
  components: {
    NavBar,
    Footer
  },
};
</script>
