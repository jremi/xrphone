<template>
  <div id="page-signup-setup-container">
    <div class="container">
      <section>
        <b-steps
          v-model="activeStep"
          :animated="isAnimated"
          :rounded="isRounded"
          :has-navigation="hasNavigation"
          :icon-prev="prevIcon"
          :icon-next="nextIcon"
          :label-position="labelPosition"
          :mobile-mode="mobileMode"
        >
          <b-step-item
            step="1"
            label="Verify Phone"
            :clickable="isStepsClickable"
            :type="{ 'is-success': isSetupSuccess }"
          >
            <VerifyPhone @onPhoneNumberVerified="onPhoneNumberVerified" />
          </b-step-item>

          <b-step-item
            step="2"
            :label="isMerchantSetup ? 'Link XRP Account' : 'Connect Wallet'"
            :clickable="isStepsClickable"
            :type="{ 'is-success': isSetupSuccess }"
          >
            <LinkXrpAccount
              v-if="isMerchantSetup"
              @onMerchantXrpAccountProvided="onMerchantXrpAccountProvided"
            />
            <ConnectWallet
              v-else
              :xumm-wallet-sign-in="xummWalletSignIn"
              @onWalletConnected="onWalletConnected"
            />
          </b-step-item>

          <b-step-item
            v-if="isMerchantSetup"
            step="3"
            label="Connect App"
            :clickable="isStepsClickable"
            :type="{ 'is-success': isSetupSuccess }"
          >
            <ConnectApp
              isMerchantInitialSetup
              :phoneNumber="userSetup.phoneNumber"
              :xrplNetwork="userSetup.xrplNetwork"
              :xrpAccount="merchantSetup.xrpAccount"
              @onConnectAppCompleted="onConnectAppCompleted"
            />
          </b-step-item>

          <b-step-item
            :step="isMerchantSetup ? 4 : 3"
            label="Finish"
            :clickable="isStepsClickable"
            :type="{ 'is-success': isSetupSuccess }"
            disabled
          >
            <Finish />
          </b-step-item>
        </b-steps>
      </section>
    </div>
  </div>
</template>

<script>
import VerifyPhone from "@/components/setup/VerifyPhone";
import LinkXrpAccount from "@/components/setup/merchant/LinkXrpAccount";
import ConnectWallet from "@/components/setup/ConnectWallet";
import ConnectApp from "@/components/setup/merchant/ConnectApp";
import Finish from "@/components/setup/Finish";

export default {
  name: "PageSignUpSetup",
  components: {
    VerifyPhone,
    LinkXrpAccount,
    ConnectWallet,
    ConnectApp,
    Finish,
  },
  data() {
    return {
      userSetup: {
        phoneNumber: null,
        xrplNetwork: null,
        xummUserToken: null,
      },
      merchantSetup: {
        xrpAccount: null,
      },
      xummWalletSignIn: {},
      activeStep: 0,
      showSocial: false,
      isAnimated: true,
      isRounded: true,
      isStepsClickable: false,
      hasNavigation: false,
      customNavigation: false,
      isSetupSuccess: false,
      prevIcon: "chevron-left",
      nextIcon: "chevron-right",
      labelPosition: "bottom",
      mobileMode: "minimalist",
    };
  },
  methods: {
    xummCreateSignIn(callback) {
      this.axios
        .get("/xumm/signin")
        .then(({ data: signIn }) => callback(signIn))
        .catch(() => {
          this.showNotification("is-danger", "Problem creating XUMM sign-in!");
        });
    },
    xrphoneCreateUser(callback) {
      this.axios
        .post("/user/create/regular", this.userSetup)
        .then(({ data }) => {
          if (data.error && data.statusText === "Conflict") {
            this.showNotification(
              "is-danger",
              `Setup failed. The phone number is already activated with XRPhone. 
              Please try a different number.`,
              8000
            );
            setTimeout(() => this.$router.push({ name: "sign-up" }), 5000);
          } else {
            callback();
          }
        })
        .catch(() => {
          this.showNotification(
            "is-danger",
            "Problem creating XRPhone user account!"
          );
        });
    },
    onPhoneNumberVerified(phoneNumber) {
      this.userSetup.phoneNumber = phoneNumber;
      this.xummCreateSignIn((signIn) => {
        this.xummWalletSignIn = signIn;
        this.activeStep += 1; // Go to: Connect Wallet step
      });
    },
    onWalletConnected({ xrpAccount, xummUserToken }, xrplNetwork) {
      this.userSetup.xrpAccount = xrpAccount;
      this.userSetup.xummUserToken = xummUserToken;
      this.userSetup.xrplNetwork = xrplNetwork;
      if (!this.isMerchantSetup) {
        this.xrphoneCreateUser(() => {
          this.activeStep += 1; // Go to: Finish step
          this.isSetupSuccess = true;
        });
      }
    },
    onMerchantXrpAccountProvided({ xrpAccount, xrplNetwork }) {
      this.userSetup.xrplNetwork = xrplNetwork;
      this.merchantSetup.xrpAccount = xrpAccount;
      this.activeStep += 1; // Go to: Connect Plugin step
    },
    onConnectAppCompleted() {
      this.activeStep += 1; // Go to: Finish step;
      this.isSetupSuccess = true;
    },
  },
  computed: {
    isMerchantSetup() {
      return this.$route.params.type === "merchant";
    },
  },
};
</script>
