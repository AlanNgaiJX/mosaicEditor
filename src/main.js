import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import "@/util/rem.js";
import "@/sass/reset.scss";

import Gesture from "@/util/gestureUnit";
import store from './store'

Vue.use(Gesture);

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
