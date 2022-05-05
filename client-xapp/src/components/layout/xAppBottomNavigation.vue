<template>
  <div class="xapp-bottom-navigation background">
    <div
      v-for="navItem in navItems"
      :key="navItem.name"
      class="navigation-item text-secondary"
      :class="{ active: $store.state.route.name === navItem.name }"
      @click="gotoRoute(navItem.name)"
    >
      <i class="bi" :class="`bi-${navItem.icon}`"></i>
      <div class="text-label">{{ navItem.textLabel }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "xAppBottomNavigation",
  data() {
    return {
      navItems: [
        {
          name: "xapp-phone",
          icon: "phone",
          textLabel: "Phone",
        },
        {
          name: "xapp-payments",
          icon: "receipt",
          textLabel: "Payments",
        },
        {
          name: "xapp-settings",
          icon: "gear",
          textLabel: "Settings",
        },
      ],
    };
  },
  methods: {
    gotoRoute(navItemName) {
      this.$router.push({ name: navItemName }).catch(() => {});
    },
  },
};
</script>

<style lang="scss">
.xapp-bottom-navigation {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  z-index: -1;
  .navigation-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.3rem;
    .text-label {
      font-size: 0.75rem;
      font-weight: bold;
      margin-top: -5px;
    }
  }
  .navigation-item.active {
    color: #3052ff !important;
  }
}
</style>
