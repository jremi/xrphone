<template>
  <div class="verify-phone-container">
    <div class="container">
      <section>
        <b-field>
          <b-input
            custom-class="phone-number-input"
            v-model="phoneNumber"
            placeholder="+12223334444"
            size="is-medium"
            icon="mobile"
          />
        </b-field>
        <br>
        <b-button @click="sendSms" type="is-primary" size="is-medium"
          ><strong>Send SMS</strong></b-button
        >
      </section>
    </div>
    <b-loading
      v-model="isLoading"
      :is-full-page="false"
      :can-cancel="false"
    ></b-loading>
  </div>
</template>

<script>
import { phone } from "phone";
import VerifyPhoneModal from "./VerifyPhoneModal.vue";

export default {
  name: "VerifyPhone",
  data() {
    return {
      isLoading: false,
      phoneNumber: "",
      code: "",
    };
  },
  methods: {
    sendSms() {
      const { isValid, phoneNumber } = phone(this.phoneNumber);
      if (!isValid) {
        this.showNotification('is-danger', "Phone number is not valid!");
        return;
      }
      this.isLoading = true;
      this.axios
        .post("/twilio/verify/phone/send", {
          phoneNumber,
        })
        .then(() => {
          this.showVerifyPhoneModal(phoneNumber);
        })
        .catch(() => {
          this.isLoading = false;
          this.showNotification('is-danger', "Problem sending sms verficiation!");
        });
    },
    showVerifyPhoneModal(phoneNumber) {
      this.isLoading = false;
      this.$buefy.modal.open({
        parent: this,
        component: VerifyPhoneModal,
        hasModalCard: true,
        trapFocus: true,
        props: {
          phoneNumber,
        },
        events: {
          isVerified: () => this.$emit("onPhoneNumberVerified", phoneNumber),
        },
      });
    },
  },
};
</script>
