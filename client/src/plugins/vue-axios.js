import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import store from "../store";
import router from "../router";
import { ToastProgrammatic as Toast } from "buefy";

Vue.use(VueAxios, axios);

Vue.axios.defaults.baseURL = process.env.VUE_APP_XRPHONE_SERVER_API;

axios.interceptors.request.use(
  (config) => {
    const token = store.getters.userToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage;

    switch (error.response.status) {
      case 401:
        errorMessage = "You are not authorized. Please sign-in.";
        break;
      default:
        errorMessage = error.message;
    }

    const ignoreToastOnPages = ["sign-in"];

    if (!ignoreToastOnPages.includes(router.currentRoute.name)) {
      Toast.open({
        type: "is-danger",
        duration: 5000,
        message: errorMessage,
      });
    }

    store.dispatch('clearUser');
    router.push({ name: "sign-in" }).catch(() => {});

    return Promise.reject(error);
  }
);
