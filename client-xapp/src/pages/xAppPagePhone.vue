<template>
  <div class="xapp-page-phone background">
    <div class="container">
      <div class="logo-container mt-1">
        <img class="logo" :src="logo" />
      </div>
      <div class="tint mt-3 p-3">
        <h4><b>Pay Invoice</b></h4>
        <button
          type="button"
          class="btn btn-warning"
          @click="dialXrphonePaymentsNumber"
          v-wave
        >
          <b
            ><i class="bi bi-telephone-fill mr-2"></i
            >{{ xrphonePaymentNumbers.US.pretty }}</b
          >
        </button>
        <div class="info mt-3">
          <i class="bi bi-info-circle mr-1"></i> To make invoice payments to
          XRPhone enabled merchants tap or dial the toll-free 24/7 automated
          phone system number above from your XRPhone linked phone.
        </div>
      </div>
      <div class="mt-3 tint p-3">
        <b><i class="bi bi-phone-fill mr-2"></i>Linked Phone:</b>
        <br />
        <div
          v-if="xrphoneUser.phone_number"
          class="text-secondary account-info"
        >
          {{ xrphoneUser.phone_number }}
        </div>
        <div
          v-else
          class="spinner-grow spinner-grow-sm mb-3"
          role="status"
        ></div>
        <br />
        <b><i class="bi bi-person-fill mr-2"></i>XRP Address:</b>
        <br />
        <div
          v-if="xrphoneUser.xrp_account"
          class="text-secondary account-info "
        >
          {{ xrphoneUser.xrp_account }}
        </div>
        <div
          v-else
          class="spinner-grow spinner-grow-sm mb-3"
          role="status"
        ></div>
        <br />
        <b><i class="bi bi-diagram-2-fill mr-2"></i>XRPL Network:</b>
        <br />
        <div
          v-if="xrphoneUser.xrpl_network"
          class="text-secondary account-info"
        >
          {{ xrphoneUser.xrpl_network }}
        </div>
        <div
          v-else
          class="spinner-grow spinner-grow-sm mb-3"
          role="status"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import xrphoneAppLogoWhite from "@/assets/images/logos/xrphone-app-logo-white.png";
import xrphoneAppLogoBlack from "@/assets/images/logos/xrphone-app-logo-black.png";

export default {
  name: "xAppPagePhone",
  data() {
    return {
      xrphonePaymentNumbers: {
        US: {
          pretty: "1 (844) 739-0111",
          raw: "18447390111",
        },
      },
    };
  },
  computed: {
    ...mapGetters(["xApp", "xrphone"]),
    xrphoneUser() {
      return this.xrphone.account.regular || {};
    },
    logo() {
      if (this.xApp.xAppStyle === "light") {
        return xrphoneAppLogoBlack;
      }
      return xrphoneAppLogoWhite;
    },
  },
  methods: {
    dialXrphonePaymentsNumber() {
      this.$xApp.triggerAction({
        command: "openBrowser",
        url: `https://xrphone-server-tunnel.ngrok.io/dial?phone=${this.xrphonePaymentNumbers.US.raw}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.xapp-page-phone {
  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    .logo {
      width: 60px;
      border-radius: 50%;
      z-index: 1;
    }
  }
  .info {
    font-size: 0.75rem;
  }
  .account-info {
    font-size: 0.85rem;
  }
}
</style>
