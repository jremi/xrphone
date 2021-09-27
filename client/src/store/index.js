import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    user: {
      token: null,
      account: {},
    },
  },
  getters: {
    isUserSignedIn: (state) => !!state.user.account.id,
    userToken: (state) => state.user.token,
    userAccount: (state) => state.user.account,
  },
  mutations: {
    SET_USER_TOKEN(state, userToken) {
      state.user.token = userToken;
    },
    SET_USER_ACCOUNT(state, userAccount) {
      state.user.account = userAccount;
    },
  },
  actions: {
    setUser(context, { token, account }) {
      context.commit("SET_USER_TOKEN", token);
      context.commit("SET_USER_ACCOUNT", account);
    },
    clearUser(context) {
      context.commit("SET_USER_TOKEN", null);
      context.commit("SET_USER_ACCOUNT", {});
    },
  },
});
