<template>
  <div id="xapp" :class="`xapp-theme-${xApp.xAppStyle}`">
    <xAppSpinnerOverlay />
    <xAppSplash
      :userSignInStatus="userSignInStatus"
      @onSignInRequested="xrphoneSignIn"
    />
    <xAppSetupWizard />
    <router-view></router-view>
    <vue-snotify></vue-snotify>
    <xAppBottomNavigation />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

import xAppSpinnerOverlay from "@/components/common/xAppSpinnerOverlay";
import xAppSplash from "@/components/common/xAppSplash";
import xAppSetupWizard from "@/components/common/xAppSetupWizard/xAppSetupWizard";
import xAppBottomNavigation from "@/components/layout/xAppBottomNavigation";

export default {
  name: "xApp",
  components: {
    xAppSpinnerOverlay,
    xAppSplash,
    xAppSetupWizard,
    xAppBottomNavigation,
  },
  data() {
    return {
      userSignInStatus: "",
    };
  },
  async mounted() {
    this.SET_SPINNER_OVERLAY(false);
    this.SET_XRPHONE({ showSplash: true });
    this.xAppSetDefaults();
    this.xAppSetTheme();
    await this.xummSetAccount();
    await this.xrphoneSignIn();
  },
  computed: {
    ...mapGetters(["xApp", "xumm", "xrphone"]),
  },
  methods: {
    ...mapMutations([
      "SET_SPINNER_OVERLAY",
      "SET_XAPP",
      "SET_XUMM",
      "SET_XRPHONE",
      "SET_XRPHONE_ACCOUNT_REGULAR",
      "RESET_XRPHONE_ACCOUNT_REGULAR",
    ]),
    xAppSetDefaults() {
      const params = new URLSearchParams(window.location.search);
      const xAppStyle = params.get("xAppStyle");
      const xAppToken = params.get("xAppToken");
      this.SET_XAPP({
        xAppStyle: xAppStyle
          ? xAppStyle.toLowerCase()
          : this.xApp.xAppStyle || "light",
        xAppToken: xAppToken || this.xApp.xAppToken,
      });
    },
    xAppSetTheme() {
      const link = document.createElement("link");
      link.href = `//xumm.app/assets/themes/xapp/xumm-${this.xApp.xAppStyle}/bootstrap.min.css`;
      link.type = "text/css";
      link.rel = "stylesheet";
      document.getElementsByTagName("head")[0].appendChild(link);
    },
    async xummSetAccount() {
      try {
        const { data: ott } = await this.axios.post("/xumm/xapp/ott", {
          xAppToken: this.xApp.xAppToken,
        });
        this.SET_XUMM({
          ...ott,
        });
      } catch (err) {
        this.$snotify.error(
          "Problem fetching xApp wallet account info!",
          "Problem"
        );
      }
    },
    async xrphoneSignIn() {
      this.userSignInStatus = "";
      const { data: xrphoneAccount } = await this.axios.get(
        "/user/lookup-by-xrp-account",
        {
          params: {
            xrp_account: this.xumm.account,
            xrpl_network: this.xumm.nodetype,
          },
        }
      );
      try {
        // XRPhone regular account **NOT** found
        if (!xrphoneAccount?.regular) {
          // Request XUMM user to sign-in with wallet.
          this.xummSignRequest((err, reason) => {
            // The XUMM wallet sign-in was successful
            if (!err && reason === "SIGNED") {
              // Turn off XRPhone splash screen and display setup wizard
              this.SET_XRPHONE({ showSplash: false, showSetupWizard: true });
            }
          });
        }
        // XRPhone regular account found
        else {
          this.SET_XRPHONE_ACCOUNT_REGULAR(xrphoneAccount.regular);
          // Verify XRPhone account XUMM user token is still valid
          if (await this.xummUserTokenValidity()) {
            // Turn off XRPhone splash screen.
            this.SET_XRPHONE({
              showSplash: false,
            });
            this.$router
              .push({
                name: this.$store.state.route.name || "xapp-phone",
              })
              .catch(() => {});
          } else {
            // Request XUMM user to re-sign-in with wallet
            this.xummSignRequest(async (err, reason) => {
              if (!err && reason === "SIGNED") {
                // Update XRPhone account with fresh XUMM user token
                const xummUserTokenUpdate = {
                  xumm_user_token: this.xrphone.xummUserToken,
                };
                await this.axios.post(
                  "/user/regular/update",
                  xummUserTokenUpdate
                );
                // Update stored XRPhone regular account info with update XUMM user token
                // Turn off XRPhone splash screen
                this.SET_XRPHONE_ACCOUNT_REGULAR({ ...xummUserTokenUpdate });
                this.SET_XRPHONE({ showSplash: false });
                this.$router
                  .push({
                    name: this.$store.state.route.name || "xapp-phone",
                  })
                  .catch(() => {});
              }
            });
          }
        }
      } catch (err) {
        this.$snotify.error(
          "Problem fetching XRPhone account info!",
          "Problem"
        );
      }
    },
    async xummSignRequest(callback) {
      const { data: signIn } = await this.axios.get("/xumm/signin");
      const xummSignInWsStatus = new WebSocket(signIn.refs.websocket_status);
      xummSignInWsStatus.onmessage = async ({ data }) => {
        try {
          const { payload_uuidv4 } = JSON.parse(data);
          if (payload_uuidv4) {
            const { data } = await this.axios.post("/xumm/signin/verify", {
              payload_uuidv4,
            });
            this.SET_XRPHONE({ xummUserToken: data.xummUserToken });
          }
        } catch (err) {
          callback(err);
        }
      };
      this.$xApp.triggerAction({
        command: "openSignRequest",
        uuid: signIn.uuid,
      });
      this.$emitter.on("payloadResolved", ({ reason }) => {
        this.userSignInStatus = reason;
        xummSignInWsStatus.close();
        callback(null, reason);
      });
    },
    async xummUserTokenValidity() {
      const { data: userTokenValidity } = await this.axios.post(
        "/xumm/usertoken/verify",
        this.xrphone.account
      );
      this.SET_XRPHONE({ sessionJwt: userTokenValidity?.jwt });
      return !!userTokenValidity?.active;
    },
  },
  watch: {
    "$route.query"({ signOut }) {
      if (signOut) {
        this.userSignInStatus = "SIGNED_OUT";
        this.RESET_XRPHONE_ACCOUNT_REGULAR();
        this.SET_XRPHONE({ sessionJwt: null, showSplash: true });
      }
    },
  },
};
</script>
