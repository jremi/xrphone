<template>
  <div id="app">
    <NavBar v-if="!isHidden" />
    <div class="main-layout">
      <router-view></router-view>
    </div>
    <!-- <Footer v-if="!isHidden" /> -->
  </div>
</template>

<script>
import NavBar from "@/components/layout/NavBar";
// import Footer from "@/components/layout/Footer";

export default {
  name: "App",
  components: {
    NavBar,
    // Footer
  },
  computed: {
    isHidden() {
      const pages = ['invoice-pay'];
      return pages.includes(this.$route.name);
    }
  },
};
</script>
