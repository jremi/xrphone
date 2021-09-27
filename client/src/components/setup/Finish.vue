<template>
  <div class="finish-container">
    <div class="container">
      <section>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 130.2 130.2"
        >
          <circle
            class="path circle"
            fill="none"
            stroke="#15F3A8"
            stroke-width="6"
            stroke-miterlimit="10"
            cx="65.1"
            cy="65.1"
            r="62.1"
          />
          <polyline
            class="path check"
            fill="none"
            stroke="#15F3A8"
            stroke-width="6"
            stroke-linecap="round"
            stroke-miterlimit="10"
            points="100.2,40.2 51.5,88.8 29.8,67.5 "
          />
        </svg>
        <p class="success is-size-2">Your XRPhone is now active</p>
        <h2 v-if="!isMerchantSetup" class="subtitle">Contact your merchant for XRPhone payment info.</h2>
        <h2 v-else class="subtitle">Update your invoices with XRPhone payment info.</h2>
        <router-link :to="{name: 'sign-in'}">Account Sign In</router-link>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "Finish",
  computed: {
    isMerchantSetup() {
      return this.$route.params.type === 'merchant';
    }
  },
};
</script>
