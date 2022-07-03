<template>
  <div class="footer-container">
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          Copyright© XRPhone {{ currentYear }}. All rights reserved
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "Footer",
  computed: {
    currentYear() {
      return (new Date()).getFullYear()
    }
  },
};
</script>
