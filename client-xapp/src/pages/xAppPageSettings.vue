<template>
  <div class="xapp-page-settings background">
    <xAppSetupWizardAccountRegular
      v-if="showRegularAccountSetup"
      isUpdateAccountMode
      @onCompleted="showRegularAccountSetup = false"
      @onCancelled="showRegularAccountSetup = false"
    />
    <div class="container mt-1">
      <h2 class="font-weight-bold mb-4">Settings</h2>
      <div class="tint p-3">
        <div class="font-weight-bold mb-2">
          <i class="bi bi-gear pr-2" />Phone Number
        </div>
        <button
          type="button"
          class="btn btn-warning btn-lg"
          v-wave
          @click="changeLinkedPhoneNumber"
        >
          Change linked phone number
        </button>
      </div>
      <br />
      <div class="tint p-3">
        <div class="font-weight-bold mb-2">
          <i class="bi bi-gear pr-2" />Account
        </div>
        <button
          type="button"
          class="btn btn-danger btn-lg"
          v-wave
          @click="deleteXrphoneAccount"
        >
          Delete XRPhone account
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import xAppSetupWizardAccountRegular from "@/components/common/xAppSetupWizard/xAppSetupWizardAccountRegular";

export default {
  name: "xAppPageSettings",
  components: {
    xAppSetupWizardAccountRegular,
  },
  data() {
    return {
      showRegularAccountSetup: false,
    };
  },
  methods: {
    changeLinkedPhoneNumber() {
      this.showRegularAccountSetup = true;
    },
    deleteXrphoneAccount() {
      this.$snotify.confirm(
        "Are you sure you want to delete your XRPhone account?",
        "Delete account",
        {
          closeOnClick: false,
          buttons: [
            {
              text: "Yes",
              action: (toast) => {
                this.$snotify.remove(toast.id);
                this.axios.delete("/user").then(() => {
                  this.$snotify.success(
                    "Your XRPhone account was deleted successfully!",
                    "Success"
                  );
                  // xApp.vue has watch on $route.query
                  this.$router.push({
                    name: "index",
                    query: { signOut: true },
                  });
                });
              },
              bold: true,
            },
            {
              text: "No",
              action: (toast) => this.$snotify.remove(toast.id),
              bold: true,
            },
          ],
        }
      );
    },
  },
};
</script>
