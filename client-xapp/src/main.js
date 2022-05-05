import Vue from 'vue'
import xApp from './xApp.vue'
import store from './store';
import router from './router';
import './plugins';
import './styles/style.scss';

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(xApp),
}).$mount('#xapp')
