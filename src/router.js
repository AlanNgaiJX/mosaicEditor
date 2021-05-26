import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: "/index",
      name: "index",
      component: () => import("./views/index.vue"),
    },
    {
      path: "/one",
      name: "one",
      component: () => import("./views/one.vue"),
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("./views/editor.vue"),
    },
  ],
});


export default router;