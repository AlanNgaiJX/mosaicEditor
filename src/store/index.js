import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mode: "preview", // preview or edit
    util: "resize", // resize or masaice
    pages: [],
    currPage: {
      id: 0,
      image_url: "",
      pageData: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        imgBoxList: [],
        masaiceBoxList: [],
      },
    },
    editPannel: {
      scale: 1,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      lock: true,
      cacheStartStatus: {},
    },
    // 笔触
    penCircle:{
      show: false,
      x: 0,
      y: 0,
      size: 25
    }
  },
  mutations: {
    // 【 初始化 pages 】
    setPages(state, { pages }) {
      state.pages = pages;
    },

    // 【 初始化当前页 】
    setCurrPage(state, { currPage }) {
      state.currPage = currPage;
      this.commit("autoPannel");
    },

    //  【 设置模式 编辑 or 预览】
    setMode(state, { mode }) {
      state.mode = mode;
    },

    // 【 设置工具 移动 or 马赛克】
    setUtil(state, { util }) {
      state.util = util;
    },

    //  【 设置笔触大小 】
    setPenSize(state, penSize){

    },

    // 【 设置editPannel 】
    changeEditPannel(state, args) {
      Object.assign(state.editPannel, args);
    },

    // 【 设置 editPannel大小 】
    setEditPannelSize(state) {
      this.commit("changeEditPannel", {
        w: state.currPage.pageData.width,
        h: state.currPage.pageData.height,
      });
    },

    // 【 智能居中 】
    autoPannel(state) {
      this.commit("setEditPannelSize");

      const size = { w: state.editPannel.w, h: state.editPannel.h };

      Vue.prototype.AutoCanvas({
        el: document.getElementById("editor"),
        w: size.w,
        h: size.h,
        callback: (args) => {
          const { x, y } = args.offset;
          const scale = args.scale;

          this.commit("changeEditPannel", {
            scale,
            x,
            y,
            cacheStartStatus: {
              scale,
              x,
              y,
              w: size.w,
              h: size.h,
            },
          });
        },
      });
    },

    // 【 双指放大面板 】
    pinchPannel(state, { newScale, mouseXy }) {
      const size = { w: state.editPannel.w, h: state.editPannel.h };

      Vue.prototype.WheelFocusZoom({
        el: document.getElementById("editor"),
        w: size.w,
        h: size.h,
        x: state.editPannel.x,
        y: state.editPannel.y,
        scale: newScale,
        lastScale: state.editPannel.scale,
        mouseXy,
        callback: (args) => {
          const { x, y } = args.offset;
          const scale = args.scale;

          this.commit("changeEditPannel", {
            scale,
            x,
            y,
          });
        },
      });
    },

    // 【 重置位置 】
    resetPannel(state) {
      this.commit("changeEditPannel", state.editPannel.cacheStartStatus);
    },

    // 【 设置笔触 】
    setPenCircle(state, data){
      Object.assign(state.penCircle, data);
    }
  },
  actions: {},
  modules: {},
});
