<template>
  <div
    class="xapp-setup-wizard"
    :style="{ 'background-color': activeStep.backgroundColor }"
    v-if="xrphone.showSetupWizard"
  >
    <xAppSetupWizardAccountRegular
      v-if="selectedAccountType === 'regular'"
      @onCompleted="SET_XRPHONE({ showSetupWizard: false })"
      @onCancelled="selectedAccountType = null"
    />
    <div class="header">
      <div class="logo">
        <img
          src="@/assets/images/logos/xrphone-app-logo-black.png"
          alt="Logo"
        />
        <div class="wordmark">XRPhone</div>
      </div>
    </div>
    <template v-if="!lastStep">
      <div class="illustration">
        <img :src="activeStep.illustration" />
      </div>
      <div class="description">
        <h3>
          <strong>{{ activeStep.heading }}</strong>
        </h3>
        <p>
          {{ activeStep.description }}
        </p>
      </div>
      <div class="footer">
        <div
          class="btn btn-action"
          :class="activeStep.button.buttonClass"
          v-wave
          @click="stepIndex++"
        >
          <span>{{ activeStep.button.text }}</span>
          <i :class="`bi bi-${activeStep.button.iconClass}`"></i>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="choose-account-type">
        <div class="customer-setup">
          <h3 class="text-white">I'm someone</h3>
          <button
            type="button"
            class="btn btn-info btn-lg"
            v-wave
            @click="regularSignUp"
          >
            who wants to pay invoices with XRP
          </button>
        </div>
        <br />
        <hr />
        <br />
        <div class="merchant-setup">
          <h3 class="text-white">I'm a merchant</h3>
          <button
            type="button"
            class="btn btn-info btn-lg"
            v-wave
            @click="merchantSignUp"
          >
            who wants invoices paid with XRP
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import xAppSetupWizardAccountRegular from "@/components/common/xAppSetupWizard/xAppSetupWizardAccountRegular";
import illustrationStep1 from "@/assets/images/xapp-setup-wizard/response.png";
import illustrationStep2 from "@/assets/images/xapp-setup-wizard/send-money.png";
import illustrationStep3 from "@/assets/images/xapp-setup-wizard/cash-register.png";

export default {
  name: "xAppSetupWizard",
  components: {
    xAppSetupWizardAccountRegular,
  },
  data() {
    return {
      stepIndex: 0,
      step: [
        {
          backgroundColor: "#ecb22e",
          illustration: illustrationStep1,
          heading: "Welcome to XRPhone",
          description:
            "Pay invoices over the phone with XRP. It's simple, fast & easy.",
          button: {
            text: "Continue",
            buttonClass: "btn-primary",
            iconClass: "chevron-right",
          },
        },
        {
          backgroundColor: "#e01e5a",
          illustration: illustrationStep2,
          heading: "Pay Invoices",
          description:
            "Customers call the XRPhone toll-free number & enter merchant invoice number.",
          button: {
            text: "Continue",
            buttonClass: "btn-primary",
            iconClass: "chevron-right",
          },
        },
        {
          backgroundColor: "#36c5f0",
          illustration: illustrationStep3,
          heading: "Sync Invoices",
          description:
            "Merchants connect compatible XRPhone invoice platforms like Quickbooks to keep things up-to-date.",
          button: {
            text: "Continue",
            buttonClass: "btn-primary",
            iconClass: "chevron-right",
          },
        },
        {
          backgroundColor: "#5bb381",
        },
      ],
      selectedAccountType: null,
    };
  },
  computed: {
    ...mapGetters(["xrphone"]),
    activeStep() {
      return this.step[this.stepIndex];
    },
    lastStep() {
      return this.stepIndex === this.step.length - 1;
    },
  },
  methods: {
    ...mapMutations(["SET_XRPHONE"]),
    regularSignUp() {
      this.selectedAccountType = "regular";
    },
    merchantSignUp() {
      this.$xApp.triggerAction({
        command: "openBrowser",
        url: "https://xrphone.app/signup/merchant",
      });
    },
  },
};
</script>

<style lang="scss">
.xapp-setup-wizard {
  background-color: black;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  z-index: 2;
  .header {
    width: 100%;
    padding: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 0;
    .logo {
      display: flex;
      align-items: center;
      .wordmark {
        color: black;
        opacity: 0.75;
        margin-left: 0.25rem;
        font-weight: bold;
        font-size: 1.75rem;
      }
      img {
        opacity: 0.75;
        width: 42px;
      }
    }
  }
  .illustration {
    margin-bottom: 10rem;
    img {
      width: 250px;
    }
  }
  .description {
    color: white;
    text-align: center;
    position: absolute;
    bottom: 110px;
    padding: 0 2.75rem;
  }
  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 1.25rem;
    .btn-action {
      width: 100%;
      padding: 1.25rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
      font-size: 1.25rem;
    }
  }
  .choose-account-type {
    text-align: center;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 1.25rem;
    border-radius: 12px;
    button {
      background-color: #3052ff;
      color: white;
      border-color: #3052ff;
    }
  }
}
</style>
