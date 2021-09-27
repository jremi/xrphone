import Vue from "vue";

import { mapActions } from "vuex";

Vue.mixin({
  methods: {
    ...mapActions(["setUser", "clearUser"]),
    signInUser(phoneNumber, accountType, smsVerificationPin) {
      this.axios
        .post("/user/signin", {
          phoneNumber,
          accountType,
          smsVerificationPin,
        })
        .then(({ data: { token, account } }) => {
          // Dirty (close sms modal)
          document
            .querySelector(".modal.is-active")
            ?.__vue__?.$vnode.context?.close();
          this.setUser({ token, account });
          this.showNotification("is-success", "The sign-in was successful!");
          this.$router.push({ name: "dashboard" });
        })
        .catch(() => {
          this.showNotification(
            "is-danger",
            "The sign-in was unsuccessful. Try again."
          );
        });
    },
    signOutUser() {
      this.clearUser();
      this.$router.push({ name: "sign-in" });
    },
  },
});
