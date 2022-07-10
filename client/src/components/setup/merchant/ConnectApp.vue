<template>
  <div class="connect-app-container">
    <div class="container">
      <section>
        <b-field v-if="!hideTitle">
          <h2 class="title">Choose your app</h2>
        </b-field>
        <div class="columns is-flex-wrap-wrap">
          <div class="column is-one-quarter" v-for="(app, index) in availableAppIntegrations" :key="index">
            <div v-if="app.appIsListed" class="card app-is-listed" @click="appIntegrationSelected(app)">
              <div class="card-image">
                <img :src="app.appIconUrl" :alt="app.appName" />
                <div class="app-name">{{ app.appName }}</div>
              </div>
            </div>
            <div v-else-if="app.appIsSandboxed" class="card app-is-sandboxed" @click="appIntegrationSelected(app)">
              <div class="sandbox-status">Sandboxed</div>
              <div class="card-image">
                <img :src="app.appIconUrl" :alt="app.appName" />
                <div class="app-name">{{ app.appName }}</div>
              </div>
            </div>
            <div v-else class="card" :class="app.cssClass" @click="appIntegrationSelected(app)">
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
import quickbooksLogo from "@/assets/images/logos/other/quickbooks-logo.png";
import xeroLogo from "@/assets/images/logos/other/xero-logo.png";

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
          id: "quickbooks",
          name: "Quickbooks Online",
          image: quickbooksLogo,
          cssClass: "quickbooks-logo",
          authUrl: process.env.VUE_APP_INTEGRATION_QUICKBOOKS_OAUTH_URL,
        },
        {
          id: "xero",
          name: "Xero",
          image: xeroLogo,
          cssClass: 'xero-logo',
          authUrl: process.env.VUE_APP_INTEGRATION_XERO_OAUTH_URL,
        }
      ],
    };
  },
  async created() {
    const [
      { data: customAppsListed },
      { data: customAppsSandboxed }
    ] = await Promise.all([
      this.axios.get('/custom-apps/listed'),
      this.axios.get(`/custom-apps/sandboxed?merchant_number=${encodeURIComponent(this.phoneNumber)}`)
    ]);
    this.availableAppIntegrations = this.availableAppIntegrations
      .concat(customAppsListed)
      .concat(customAppsSandboxed);
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
      const data = this.merchantSetup;
      if (app.appIsListed || app.appIsSandboxed) data.appId = app.id;
      const state = encodeURIComponent(JSON.stringify(data));
      const height = 680;
      const width = 400;
      const top = window.top.outerHeight / 2 + window.top.screenY - height / 2;
      const left = window.top.outerWidth / 2 + window.top.screenX - width / 2;
      const authUrl = app.appIsListed || app.appIsSandboxed 
        ? app.appSettingsClientAuthorizeUrl 
        : app.authUrl;
      const oauthWindow = window.open(
        `${authUrl}&state=${state}`,
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
