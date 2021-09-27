<template>
  <div id="page-signin-container">
    <div class="container">
      <b-tabs
        v-model="activeTab"
        size="is-medium"
        position="is-centered"
        class="block"
      >
        <b-tab-item label="Personal Sign In">
          <b-field>
            <b-input
              custom-class="phone-number-input"
              v-model="phoneNumber"
              placeholder="+12223334444"
              size="is-medium"
              icon="mobile"
            />
          </b-field>
          <br />
          <b-button @click="signIn"><strong>SMS Sign In</strong></b-button>
        </b-tab-item>
        <b-tab-item label="Merchant Sign In">
          <b-field>
            <b-input
              custom-class="phone-number-input"
              v-model="phoneNumber"
              placeholder="+12223334444"
              size="is-medium"
              icon="mobile"
            />
          </b-field>
          <br />
          <b-button @click="signIn"><strong>SMS Sign In</strong></b-button>
        </b-tab-item>
      </b-tabs>
      <b-loading
        v-model="isLoading"
        :is-full-page="false"
        :can-cancel="false"
      ></b-loading>
    </div>
  </div>
</template>

<script>
import { phone } from "phone";
import VerifyPhoneModal from "@/components/setup/VerifyPhoneModal";

export default {
  name: "PageSignIn",
  data() {
    return {
      isLoading: false,
      activeTab: 0,
      phoneNumber: "",
      code: "",
    };
  },
  computed: {
    accountType() {
      const mapping = {
        0: "regular",
        1: "merchant",
      };
      return mapping[this.activeTab];
    },
  },
  methods: {
    async signIn() {
      const { phoneNumber } = phone(this.phoneNumber);
      if (phoneNumber) {
        this.isLoading = true;
        // Perform pre-check to determine if the provided number is valid
        const {
          data: { accountFound },
        } = await this.axios.get("/user/lookup", {
          params: { phoneNumber, accountType: this.accountType },
        });
        if (!accountFound) {
          this.isLoading = false;
          this.showNotification(
            "is-danger",
            "We could not find any XRPhone account linked to this phone number!"
          );
          return;
        }
        this.axios
          .post("/twilio/verify/phone/send", {
            phoneNumber,
          })
          .then(() => this.showVerifyPhoneModal(phoneNumber))
          .catch(() => {
            this.isLoading = false;
            this.showNotification(
              "is-danger",
              "Problem sending sms sign-in verficiation!"
            );
          });
      } else {
        this.showNotification(
          "is-danger",
          "Phone number not valid. Please try again."
        );
      }
    },
    showVerifyPhoneModal(phoneNumber) {
      this.isLoading = false;
      this.$buefy.modal.open({
        parent: this,
        component: VerifyPhoneModal,
        canCancel: false,
        hasModalCard: true,
        trapFocus: true,
        props: {
          phoneNumber,
          isUserSignInAttempt: true,
        },
        events: {
          onSmsPinCodeEntered: (smsVerificationPin) =>
            this.signInUser(phoneNumber, this.accountType, smsVerificationPin),
        },
      });
    },
  },
};
</script>
