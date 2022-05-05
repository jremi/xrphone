<template>
  <div class="xapp-setup-wizard-account-regular">
    <div class="cancel" @click="$emit('onCancelled')">
      Cancel
    </div>
    <h3 class="text-secondary">
      <strong>{{
        showVerify ? "Enter SMS Code" : "Verify Mobile Phone"
      }}</strong>
    </h3>
    <template v-if="!showVerify">
      <h5>Please confirm your country code and enter your phone number.</h5>
      <div class="m-2 alert alert-primary font-weight-bold" role="alert">
        <i class="bi bi-info-circle pr-2" />Currently XRPhone supports United
        States and Canada. We hope to expand regions based on demand. To learn
        more visit the XRPhone Discord.
      </div>
      <div class="m-4">
        <input
          ref="phoneInput"
          v-model="phoneNumber"
          v-mask="['(###) ###-####']"
          @focus="focusPhoneInputField"
          type="tel"
          placeholder="(555) 555-5555"
          class="form-control form-control-lg mt-4"
        />
      </div>
      <div
        class="btn btn-action mt-3"
        :style="{
          'pointer-events': !formValid ? 'none' : 'inherit',
          opacity: !formValid ? 0.3 : 1,
        }"
        v-wave
        @click="sendSms"
        :disabled="!formValid"
      >
        Send SMS
      </div>
    </template>
    <transition name="bounce">
      <div v-if="showVerify">
        <h5>
          We've sent the code to your mobile phone for
          <strong>{{ phoneNumber }}</strong> on your device. Check your text
          messages.
        </h5>
        <br />
        <PincodeInput
          v-model="code"
          placeholder="0"
          :length="smsCodeMaxLength"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { phone } from "phone";
import PincodeInput from "vue-pincode-input";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";

export default {
  name: "xAppSetupWizardAccountRegular",
  components: {
    PincodeInput,
  },
  props: {
    isUpdateAccountMode: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      phoneNumber: "",
      phoneNumberFormatted: "",
      showVerify: false,
      code: "",
      smsCodeMaxLength: 6,
      intlTelInputInstance: null,
    };
  },
  computed: {
    ...mapGetters(["xumm", "xrphone"]),
    formValid() {
      return this.phoneNumber !== "";
    },
  },
  mounted() {
    this.intlTelInputInstance = intlTelInput(this.$refs.phoneInput, {
      onlyCountries: ["us", "ca"],
      separateDialCode: true,
    });
  },
  methods: {
    ...mapMutations(["SET_XRPHONE", "SET_XRPHONE_ACCOUNT_REGULAR"]),
    sendSms() {
      const { isValid, phoneNumber } = phone(this.phoneNumber);
      if (!isValid) {
        this.$snotify.error(
          "The phone number entered is not valid. Please re-try!",
          "Invalid Number"
        );
        return;
      }
      this.axios
        .post("/twilio/verify/phone/send", {
          phoneNumber,
        })
        .then(() => {
          this.phoneNumberFormatted = phoneNumber;
          this.showVerify = true;
        })
        .catch(() => {
          this.$snotify.error(
            "Problem sending SMS verification!",
            "Problem Sending"
          );
        });
    },
    confirmSms() {
      this.axios
        .post("/twilio/verify/phone/check", {
          phoneNumber: this.phoneNumberFormatted,
          code: this.code,
        })
        .then(({ data }) => {
          const isApproved = data === "approved";
          if (isApproved) {
            this.isUpdateAccountMode
              ? this.xrphoneUpdateRegularUser()
              : this.xrphoneCreateRegularUser();
          } else {
            this.$snotify.error("Incorrect verification code", "Problem", {
              position: "rightTop",
            });
          }
        })
        .catch(() => {
          this.$snotify.error(
            "Problem confirming SMS verification!",
            "Problem",
            { position: "rightTop" }
          );
        });
    },
    xrphoneCreateRegularUser() {
      const regularUser = {
        phoneNumber: this.phoneNumberFormatted,
        xrpAccount: this.xumm.account,
        xrplNetwork: this.xumm.nodetype,
        xummUserToken: this.xrphone.xummUserToken,
      };
      this.axios
        .post("/user/create/regular", regularUser)
        .then(({ data }) => {
          if (data.error && data.statusText === "Conflict") {
            this.$snotify.error(
              `Setup failed. The phone number is already activated with XRPhone.
              Try different number`
            );
            return;
          }
          if (!data) throw new Error();
          this.SET_XRPHONE_ACCOUNT_REGULAR(data.body[0]);
          this.xummUserTokenValidity(() => {
            this.$snotify.success("Phone number verified!", "Congrats", {
              position: "rightTop",
            });
            this.$emit("onCompleted");
          });
        })
        .catch(() => {
          this.$snotify.error(
            "Problem creating XRPhone user account!",
            "Problem"
          );
        });
    },
    xrphoneUpdateRegularUser() {
      this.axios
        .post("/user/regular/update", {
          phone_number: this.phoneNumberFormatted,
        })
        .then(({ data }) => {
          if (!data) throw new Error();
          this.SET_XRPHONE_ACCOUNT_REGULAR({
            phone_number: this.phoneNumberFormatted,
          });
          this.xummUserTokenValidity(() => {
            this.$snotify.success("Phone number updated!", "Updated", {
              position: "rightTop",
            });
            this.$emit("onCompleted");
          });
        })
        .catch(() => {
          this.$snotify.error(
            "Problem updating XRPhone user account!",
            "Problem"
          );
        });
    },
    xummUserTokenValidity(callback) {
      this.axios
        .post("/xumm/usertoken/verify", this.xrphone.account)
        .then(({ data: userTokenValidity }) => {
          this.SET_XRPHONE({ sessionJwt: userTokenValidity?.jwt });
          callback();
        })
        .catch(() => {
          this.$snotify.error(
            "Problem validating XRPhone user account!",
            "Problem"
          );
        });
    },
    focusPhoneInputField() {
      this.$refs.phoneInput.scrollIntoView();
    },
  },
  watch: {
    code(smsVerificationPin) {
      if (smsVerificationPin.length === this.smsCodeMaxLength) {
        this.confirmSms();
      }
    },
  },
};
</script>

<style lang="scss">
.xapp-setup-wizard-account-regular {
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
  text-align: center;
  padding: 1rem;
  .cancel {
    cursor: pointer;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    position: absolute;
    top: 0;
    right: 0;
    color: white;
    margin: 1rem;
  }
  img {
    width: 250px;
  }
  .btn-action {
    width: 100%;
    padding: 1rem;
    background-color: #3052ff;
    font-weight: bold;
  }
}
</style>
