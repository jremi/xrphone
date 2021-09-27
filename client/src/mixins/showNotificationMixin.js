import Vue from "vue";

Vue.mixin({
  methods: {
    showNotification(type, message, duration = 5000) {
      this.$buefy.notification.open({
        type,
        message,
        duration,
        position: "is-bottom-right",
        hasIcon: true,
      });
    },
  },
});
