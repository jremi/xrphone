import Vue from "vue";

const xAppPlugin = {
  install(Vue) {
    this.installCommandEventListeners();
    Vue.prototype.$xApp = {
      /**
       * triggerAction
       * - https://xumm.readme.io/docs/xapps#special-actions-js-in-xapps
       */
      triggerAction(commandOptions) {
        if (typeof window.ReactNativeWebView !== "undefined") {
          window.ReactNativeWebView.postMessage(JSON.stringify(commandOptions));
          return;
        }
      },
    };
  },
  installCommandEventListeners() {
    const messageHandler = (event) => {
      if (event.data) {
        // console.log('messageHandler:event.data>', event.data)
        try {
          const data = JSON.parse(event.data);
          const method = data.method;
          if (method) {
            Vue.prototype.$emitter.emit(method, data);
          }
        } catch (e) {} // eslint-disable-line
      }
    };
    if (typeof window.addEventListener === "function") {
      window.addEventListener("message", messageHandler);
    }
    if (typeof document.addEventListener === "function") {
      document.addEventListener("message", messageHandler);
    }
  },
};

Vue.use(xAppPlugin);
