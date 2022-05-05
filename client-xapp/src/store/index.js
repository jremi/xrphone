import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      // This omits @/plugins/vue-router-sync state.route from persisting
      paths: ["xApp", "xumm", "xrphone"],
    }),
  ],
  state: {
    xApp: {
      xAppStyle: null,
      xAppToken: null,
    },
    xumm: {},
    xrphone: {
      xummUserToken: null,
      showSplash: false,
      showSetupWizard: false,
      sessionJwt: null,
      account: {
        regular: null,
        merchant: null,
      },
    },
  },
  getters: {
    xApp: (state) => state.xApp,
    xumm: (state) => state.xumm,
    xrphone: (state) => state.xrphone,
  },
  mutations: {
    SET_XAPP(state, xAppSettings) {
      state.xApp = { ...state.xApp, ...xAppSettings };
    },
    SET_XUMM(state, xummSettings) {
      state.xumm = { ...state.xumm, ...xummSettings };
    },
    SET_XRPHONE(state, xrphoneSettings) {
      state.xrphone = { ...state.xrphone, ...xrphoneSettings };
    },
    SET_XRPHONE_ACCOUNT_REGULAR(state, xrphoneAccountRegular) {
      state.xrphone.account.regular = {
        ...state.xrphone.account.regular,
        ...xrphoneAccountRegular,
      };
    },
    RESET_XRPHONE_ACCOUNT_REGULAR(state) {
      state.xrphone.account.regular = null;
    },
  },
});
