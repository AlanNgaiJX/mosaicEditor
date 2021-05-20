import Vue from 'vue'
import App from './App.vue'
import "@/util/rem.js";
import "@/sass/reset.scss";

import Gesture from "@/util/gestureUnit";
import EditCanvasUnit from "@/util/editCanvasUnit";
import store from './store'

Vue.use(Gesture);
Vue.use(EditCanvasUnit);

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
