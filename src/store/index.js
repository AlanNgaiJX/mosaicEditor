import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

function AutoCanvas(args) {
  var el = args.el || document.body, //编辑区域相对某层的比例
    w = args.w, //编辑区域宽度
    h = args.h, //编辑区域高度
    zoomScale = args.zoomScale || null, //新的缩放量
    lastInfo = args.lastInfo, //缩放前的数据
    mouseXy = args.mouseXy, //鼠标滚动时的坐标
    callback = args.callback,
    _canvasScale = args.canvasScale || 1;

  var elW = el.clientWidth,
    elH = el.clientHeight;

  var scaleW = elW / w,
    scaleH = elH / h;

  var scale = scaleW < scaleH ? scaleW : scaleH;

  //编辑区域的缩放倍数 * 占编辑画布的缩放倍数 + 缩放的量
  var _scale = zoomScale ? zoomScale : scale * _canvasScale;

  var offsetX, offsetY;

  if (lastInfo) {
    offsetX = lastInfo.x + ((lastInfo.scale - _scale) * w) / 2;
    offsetY = lastInfo.y + ((lastInfo.scale - _scale) * h) / 2;

    if (mouseXy) {
      //((新倍数 / 上一次的倍数) - 1) * (鼠标位置跟缩放中心的距离)
      var _offsetX =
          (_scale / lastInfo.scale - 1) *
          (mouseXy.x - (offsetX + (w * _scale) / 2) - el.offsetLeft),
        _offsetY =
          (_scale / lastInfo.scale - 1) *
          (mouseXy.y - (offsetY + (h * _scale) / 2) - el.offsetTop);

      offsetX = offsetX - _offsetX;
      offsetY = offsetY - _offsetY;
    }
  } else {
    offsetX = (elW - w * _scale) / 2;
    offsetY = (elH - h * _scale) / 2;
  }

  if (typeof callback === "function") {
    callback({
      scale: _scale,
      offset: {
        x: offsetX,
        y: offsetY,
      },
    });
  }
}

function WheelFocusZoom(args) {
  var el = args.el || document.body, //编辑区域相对某层的比例
    w = args.w, //编辑区域宽度
    h = args.h, //编辑区域高度
    x = args.x,
    y = args.y,
    scale = args.scale, //新的缩放比例
    lastScale = args.lastScale, //上次的缩放比例
    mouseXy = args.mouseXy, //鼠标滚动时的坐标
    callback = args.callback;

  var elRect = el.getBoundingClientRect();

  var offsetX = x + ((lastScale - scale) * w) / 2,
    offsetY = y + ((lastScale - scale) * h) / 2;

  //((新倍数 / 上一次的倍数) - 1) * (鼠标位置跟缩放中心的距离)
  var _offsetX =
      (scale / lastScale - 1) *
      (mouseXy.x - (offsetX + (w * scale) / 2) - elRect.left),
    _offsetY =
      (scale / lastScale - 1) *
      (mouseXy.y - (offsetY + (h * scale) / 2) - elRect.top);

  if (typeof callback === "function") {
    callback({
      scale: scale,
      offset: {
        x: offsetX - _offsetX,
        y: offsetY - _offsetY,
      },
    });
  }
}

export default new Vuex.Store({
  namespaced: true,
  state: {
    mode: "preview", // preview or edit
    util: "resize", // resize or mosaic
    pages: [],
    currPage: {
      id: 0,
      image_url: "",
      image_type: "",
      filename: "",
      pageData: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        imgBoxList: [],
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
      id: 1,
    },
    paintStep: {
      isOn: false,
      index: -1,
      queue: [],
    },
  },
  getters: {
    // 【 屏幕坐标转换为 canvas 图片坐标 】
    getXy(state) {
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
        const sX = (pageX - wrap_x - x) / scale;
        const sY = (pageY - wrap_y - y) / scale;

        // 那么在图片上的位置为
        const originX = sX * scaleRatio;
        const originY = sY * scaleRatio;

        return { originX, originY, sX, sY };
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

      AutoCanvas({
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

      WheelFocusZoom({
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

    // 【 重缓存 imgBox】
    reCacheImgBox(state) {
      const imgBox = state.currPage.pageData.imgBoxList[0];
      const { canvas } = imgBox;
      const context = canvas.getContext("2d");
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      imgBox.imageData = imageData;
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
      const canvas = state.currPage.pageData.imgBoxList[0].canvas;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      state.paintStep.queue = [];
      state.paintStep.index = -1;
      state.paintStep.isOn = true;
      state.paintStep.queue.push(imageData);
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

    // 【 销毁（重置）整个编辑器】
    destoryEditor(state) {
      state.mode = "preview";
      state.util = "resize";
      state.pages = [];
      state.currPage = {
        id: 0,
        image_url: "",
        image_type: "",
        filename: "",
        pageData: {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          imgBoxList: [],
        },
      };
      state.editPannel = {
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
      };

      state.penCircle = {
        show: false,
        x: 0,
        y: 0,
        size: 1,
        id: 1,
      };

      state.paintStep = {
        isOn: false,
        index: -1,
        queue: [],
      };
    },
  },
  actions: {},
});
