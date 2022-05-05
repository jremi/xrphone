<template>
  <!-- default placeholder page index -->
  <div class="xapp-page-index">
    <img src="@/assets/images/logos/xrphone-app-logo-white.png" alt="Logo" />
    <div class="wordmark">XRPhone</div>
  </div>
</template>

<script>
export default {
  name: "xAppPageIndex",
};
</script>

<style lang="scss" scoped>
.xapp-page-index {
  background-color: black;
  width: 100vw;
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 110px;
    border-radius: 50%;
  }
  .wordmark {
    color: white;
    margin-top: 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;
  }
}
</style>
