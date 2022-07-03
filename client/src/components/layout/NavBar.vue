<template>
  <div class="navbar-container">
    <b-navbar class="is-black" fixed-top spaced> 
      <template #brand>
        <b-navbar-item tag="div">
          <router-link :to="{name: isUserSignedIn ? 'dashboard' : 'landing'}">
            <div class="logo-wrapper">
              <img
                src="https://www.xrphone.app/images/xrphone-logo-white.png"
                alt="Logo"
              />
            </div>
          </router-link>
        </b-navbar-item>
      </template>
      <template #end>
        <b-navbar-item tag="div">
          <div class="buttons">
            <template v-if="!isUserSignedIn">
              <router-link :to="{name: 'sign-up'}" class="button is-primary">
                <strong>Get Started</strong>
              </router-link>
              <router-link :to="{name: 'sign-in'}" class="button is-light">
                Sign In
              </router-link>
            </template>
            <template v-else>
              <b-button @click="signOutUser" type="is-green">
                Sign Out (<strong>{{userAccount.phoneNumber}}</strong>)
              </b-button>
            </template>
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "NavBar",
  computed: {
    ...mapGetters(['isUserSignedIn', 'userAccount'])
  },
};
</script>
