import Vue from 'vue';
import Emitter from 'tiny-emitter';

Vue.prototype.$emitter = new Emitter();
