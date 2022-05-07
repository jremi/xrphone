<template>
  <div class="xapp-spinner-overlay">
    <div class="loader-container background" v-if="xrphone.showSpinnerOverlay">
      <img class="logo" :src="logo" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import xrphoneAppLogoWhite from "@/assets/images/logos/xrphone-app-logo-white.png";
import xrphoneAppLogoBlack from "@/assets/images/logos/xrphone-app-logo-black.png";

export default {
  name: "xAppSpinnerOverlay",
  computed: {
    ...mapGetters(["xApp", "xrphone"]),
    logo() {
      if (this.xApp.xAppStyle === "light") {
        return xrphoneAppLogoBlack;
      }
      return xrphoneAppLogoWhite;
    },
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
    .logo {
      width: 60px;
      border-radius: 50%;
      z-index: 2;
      animation-name: spin;
      animation-duration: 500ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }
  }
}
</style>
