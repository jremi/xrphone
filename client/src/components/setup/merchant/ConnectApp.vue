<template>
  <div class="connect-app-container">
    <div class="container">
      <section>
        <b-field v-if="!hideTitle">
          <h2 class="title">Choose your app</h2>
        </b-field>
        <div class="columns">
          <div
            class="column"
            v-for="(app, index) in availableAppIntegrations"
            :key="index"
          >
            <div
              class="card"
              :class="app.cssClass"
              @click="appIntegrationSelected(app)"
            >
              <div class="card-image">
                <img :src="app.image" :alt="app.name" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import freshbooksLogo from "@/assets/images/logos/other/freshbooks-logo.png";
import oracleNetSuiteLogo from "@/assets/images/logos/other/oracle-netsuite-logo.png";
import quickbooksLogo from "@/assets/images/logos/other/quickbooks-logo.png";

export default {
  name: "Connectapp",
  props: {
    isMerchantInitialSetup: {
      type: Boolean,
      default: false,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    xrplNetwork: {
      type: String,
      required: false,
    },
    xrpAccount: {
      type: String,
      required: false,
    },
    destinationTag: {
      type: String,
      required: false,
    },
    hideTitle: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      availableAppIntegrations: [
        {
          id: "freshbooks",
          name: "Freshbooks",
          image: freshbooksLogo,
          cssClass: null,
          authUrl: process.env.VUE_APP_INTEGRATION_FRESHBOOKS_OAUTH_URL,
        },
        {
          id: "oracle_net_suite",
          name: "Oracle NetSuite",
          image: oracleNetSuiteLogo,
          cssClass: "oracle-logo",
          authUrl: null,
        },
        {
          id: "quickbooks_online",
          name: "Quickbooks Online",
          image: quickbooksLogo,
          cssClass: "quickbooks-logo",
          authUrl: null,
        },
      ],
    };
  },
  computed: {
    merchantSetup() {
      return {
        isMerchantInitialSetup: this.isMerchantInitialSetup,
        phoneNumber: this.phoneNumber,
        xrplNetwork: this.xrplNetwork,
        xrpAccount: this.xrpAccount,
        destinationTag: this.destinationTag,
      };
    },
  },
  methods: {
    appIntegrationSelected(app) {
      const state = encodeURIComponent(JSON.stringify(this.merchantSetup));
      const height = 680;
      const width = 400;
      const top = window.top.outerHeight / 2 + window.top.screenY - height / 2;
      const left = window.top.outerWidth / 2 + window.top.screenX - width / 2;
      /*
        https://auth.freshbooks.com/service/auth/oauth/authorize
          ?client_id=e41c15d9dab6c60dab43c0e5e12da18aef787a3dc2764711fa63eb9c6d19212c
          &response_type=code
          &redirect_uri=https://xrphone-server-tunnel.ngrok.io/plugins/freshbooks/oauth
      */
      const oauthWindow = window.open(
        `${app.authUrl}&state=${state}`,
        "_blank",
        `toolbar=no,scrollbars=yes,resizable=no,top=${top},left=${left},width=${width},height=${height}`
      );
      const oAuthWindowClosedStatus = setInterval(() => {
        if (oauthWindow.closed) {
          clearInterval(oAuthWindowClosedStatus);
          this.$emit("onConnectAppCompleted");
        }
      }, 500);
    },
  },
};
</script>
