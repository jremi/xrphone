<template>
  <div class="xapp-splash background" v-show="xrphone.showSplash">
    <img src="@/assets/images/logos/xrphone-app-logo-white.png" alt="Logo" />
    <div class="wordmark">XRPhone</div>
    <transition name="bounce">
      <div v-if="showSignInButton" class="not-signed-in tint text-primary">
        <span v-if="userSignInStatus === 'DECLINED'">
          Sign In failed or rejected. To continue you must successfully Sign In
          first.</span
        >
        <span v-else-if="userSignInStatus === 'SIGNED_OUT'">
          You are currently Signed Out. To continue please Sign In.
        </span>
        <button
          @click="$emit('onSignInRequested')"
          type="button"
          class="btn btn-primary p-4"
          v-wave
        >
          Sign In
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "xAppSplash",
  props: {
    userSignInStatus: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["xrphone"]),
    showSignInButton() {
      return (
        this.userSignInStatus === "DECLINED" ||
        this.userSignInStatus === "SIGNED_OUT"
      );
    },
  },
};
</script>

<style lang="scss">
.xapp-splash {
  background-color: black !important;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 110px;
    border-radius: 50%;
    z-index: 1;
    animation-name: spin;
    animation-duration: 750ms;
    animation-iteration-count: 3;
    animation-timing-function: linear;
  }
  .wordmark {
    color: white;
    margin-top: 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;
    opacity: 0;
    z-index: 2;
    animation: fadeIn 3s ease-in both;
  }
  .not-signed-in {
    z-index: 1;
    margin: 1rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    button {
      margin-top: 1rem;
      width: 100%;
    }
  }
}
</style>
