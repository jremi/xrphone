<template>
  <div class="verify-phone-modal-container">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Verify SMS</p>
      </header>
      <section class="modal-card-body">
        <div class="confirm-container">
          <div class="info">
            Please enter the verification code sent to your mobile phone.
          </div>
          <PincodeInput
            v-model="code"
            placeholder="0"
            :length="smsCodeMaxLength"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import PincodeInput from "vue-pincode-input";

export default {
  name: "VerifyPhone",
  components: {
    PincodeInput,
  },
  props: {
    phoneNumber: {
      type: String,
      required: true,
    },
    isUserSignInAttempt: {
      type: Boolean,
      default: false,
      required: false,
    }
  },
  data() {
    return {
      code: "",
      smsCodeMaxLength: 6,
    };
  },
  methods: {
    confirmSms() {
      this.axios
        .post("/twilio/verify/phone/check", {
          phoneNumber: this.phoneNumber,
          code: this.code,
        })
        .then(({ data }) => {
          const isApproved = data === "approved";
          this.showNotification(
            isApproved ? "is-success" : "is-danger",
            isApproved
              ? "Phone number verified!"
              : "Incorrect verification code. Please try again."
          );
          if (isApproved) {
            this.$emit("isVerified");
            this.$parent.close();
          }
        })
        .catch(() => {
          this.showNotification(
            "is-danger",
            "Problem checking sms verifcation!"
          );
        });
    },
  },
  watch: {
    code(smsVerificationPin) {
      if (smsVerificationPin.length === this.smsCodeMaxLength) {
        if (this.isUserSignInAttempt) {
          this.$emit('onSmsPinCodeEntered', smsVerificationPin);
        } else {
          this.confirmSms();
        }
      }
    },
  },
};
</script>
