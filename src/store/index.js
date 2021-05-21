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
      wrap: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      },
      cacheStartStatus: {},
    },
    // 笔触
    penCircle: {
      show: false,
      x: 0,
      y: 0,
      size: 1,
      basicSize: 0,
      basicPercent: 0.01,
      id: 2,
    },
    paintStep: {
      isOn: false,
      index: -1,
      queue: [],
    },
  },
  getters: {
    // 【 屏幕坐标转换为 canvas 图片坐标 】
    getOriginXy(state) {
      return function(pagePoint) {
        const { pageX, pageY } = pagePoint;
        const {
          x: wrap_x,
          y: wrap_y,
          w: wrap_w,
          h: wrap_h,
        } = state.editPannel.wrap;
        const { x, y, w, h, scale } = state.editPannel;

        const imgBox = state.currPage.pageData.imgBoxList[0];
        const {
          width: box_w,
          height: box_h,
          originWidth: box_ow,
          originHeight: box_oh,
        } = imgBox;

        const scaleRatio = box_ow / box_w;

        // 假设这就是屏幕图片的x y
        const simg_x = (pageX - wrap_x - x) / scale;
        const simg_y = (pageY - wrap_y - y) / scale;

        // 那么在图片上的位置为
        const originX = simg_x * scaleRatio;
        const originY = simg_y * scaleRatio;

        return { originX, originY };
      };
    },
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
    setPenCircle(state, data) {
      Object.assign(state.penCircle, data);
    },

    // 【 重绘 imgBox 】
    reRenderImgBox(state, { src }) {
      state.currPage.pageData.imgBoxList[0].src = src;
    },

    // 【 重置 imgBox 】
    resetImgBox(state) {
      const { canvas, imageData } = state.currPage.pageData.imgBoxList[0];
      const ctx = canvas.getContext("2d");
      ctx.putImageData(imageData, 0, 0);
      this.commit("reRenderImgBox", { src: canvas.toDataURL() });
    },

    // 【 初始化 paintStep】
    initPaintStep(state) {
      state.paintStep.queue = [];
      state.paintStep.index = -1;
      state.paintStep.isOn = true;
      state.paintStep.queue.push(
        state.currPage.pageData.imgBoxList[0].imageData
      );
      state.paintStep.index = 0;
    },

    // 【 增步 】
    addPaintStep(state) {
      const canvas = state.currPage.pageData.imgBoxList[0].canvas;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      state.paintStep.queue.push(imageData);
      state.paintStep.index = state.paintStep.queue.length - 1;
    },

    // 【 撤销步骤 】
    undoStep(state) {
      const index = state.paintStep.index;
      const imageData = state.paintStep.queue[index - 1];
      state.paintStep.index = index - 1;

      const canvas = state.currPage.pageData.imgBoxList[0].canvas;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(imageData, 0, 0);
      this.commit("reRenderImgBox", { src: canvas.toDataURL() });
    },

    // 【 重做步骤 】
    redoStep(state) {
      const index = state.paintStep.index;
      const imageData = state.paintStep.queue[index + 1];
      state.paintStep.index = index + 1;

      const canvas = state.currPage.pageData.imgBoxList[0].canvas;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(imageData, 0, 0);
      this.commit("reRenderImgBox", { src: canvas.toDataURL() });
    },

    // 【 销毁（重置）步骤管理 】
    destroyPintStep(state) {
      state.paintStep.queue = [];
      state.paintStep.index = -1;
      state.paintStep.isOn = false;
    },
  },
  actions: {},
  modules: {},
});
