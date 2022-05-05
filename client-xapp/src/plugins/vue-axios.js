import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import store from "../store/index";

Vue.use(VueAxios, axios);

Vue.axios.defaults.baseURL = process.env.VUE_APP_XRPHONE_SERVER_API;

axios.interceptors.request.use(
  (config) => {
    const token = store.state.xrphone.sessionJwt;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
