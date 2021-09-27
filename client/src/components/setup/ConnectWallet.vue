<template>
  <div class="connect-wallet-container">
    <div class="container">
      <section>
        <div class="columns">
          <div class="column is-flex is-flex-direction-column	is-justify-content-center">
            <XrplNetworkSelect v-model="xrplNetwork" />
            <br>
            <b-button
              tag="a"
              :href="linkSignIn"
              target="_blank"
              size="is-medium"
              icon-left="external-link-alt"
              class="has-text-weight-bold"
              type="is-dark"
            >
              XUMM Wallet Sign In
            </b-button>
          </div>
          <div class="column">
            <img class="xumm-signin-qr" :src="qrSignIn" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import XrplNetworkSelect from "@/components/common/XrplNetworkSelect";

export default {
  name: "ConnectWallet",
  components: {
    XrplNetworkSelect,
  },
  data() {
    return {
      wallet: {
        status: null,
      },
      xrplNetwork: "MAINNET",
    };
  },
  props: {
    xummWalletSignIn: {
      type: Object,
      required: true,
    },
  },
  computed: {
    linkSignIn() {
      return this.xummWalletSignIn.next?.always;
    },
    qrSignIn() {
      return this.xummWalletSignIn.refs?.qr_png;
    },
    signInStatusWebSocketUri() {
      return this.xummWalletSignIn.refs?.websocket_status;
    },
  },
  methods: {
    connectXummSignInWebSocket() {
      const xummSignInWsStatus = new WebSocket(this.signInStatusWebSocketUri);
      xummSignInWsStatus.onmessage = async ({ data }) => {
        const { signed, user_token, payload_uuidv4 } = JSON.parse(data);
        if (signed && user_token) {
          xummSignInWsStatus.close();
          const { data: xummSignInVerify } = await this.axios.post(
            "/xumm/signin/verify",
            {
              payload_uuidv4,
            }
          );
          this.$emit("onWalletConnected", xummSignInVerify, this.xrplNetwork);
          this.showNotification(
            "is-success",
            "XUMM wallet sign-in successful!"
          );
        } else if (!signed && user_token) {
          xummSignInWsStatus.close();
          this.showNotification("is-danger", "XUMM wallet sign-in declined!");
          setTimeout(() => this.$router.push({ name: "sign-up" }), 5000);
        }
      };
    },
  },
  watch: {
    xummWalletSignIn() {
      this.connectXummSignInWebSocket();
    },
  },
};
</script>
