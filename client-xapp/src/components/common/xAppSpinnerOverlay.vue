<template>
  <div class="xapp-spinner-overlay">
    <div class="loader-container background" v-if="xrphone.showSpinnerOverlay">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "xAppSpinnerOverlay",
  computed: {
    ...mapGetters(["xrphone"]),
  },
};
</script>

<style lang="scss" scoped>
.xapp-spinner-overlay {
  .loader-container {
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 56px);
    width: 100vw;
    position: fixed;
  }
}
</style>
