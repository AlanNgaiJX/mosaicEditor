<template>
  <div
    id="paintCanvas"
    class="paintCanvas"
    ref="paintCanvas"
    :style="paintCanvasStyle"
    v-Gesture.stop="{
      init: initGesture,
      touch,
      slide,
      finish,
    }"
  >
    <canvas
      ref="chir"
      :width="editPannel.w"
      :height="editPannel.h"
      :style="{
        opacity: 0.6,
      }"
    ></canvas>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "paintCanvas",
  data() {
    return {
      gesture: null,
      canvas: null,
      ctx: null,
      chirCanvas: null,
      chirCtx: null,
      lastX: 0,
      lastY: 0,
    };
  },
  computed: {
    ...mapState(["editPannel", "mode", "util", "currPage", "penCircle"]),
    paintCanvasStyle() {
      const { w, h, x, y, scale } = this.editPannel;
      return {
        width: w + "px",
        height: h + "px",
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
      };
    },
  },
  methods: {
    initContext() {
      const { canvas } = this.currPage.pageData.imgBoxList[0];
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.$store.commit("initPaintStep");

      this.chirCanvas = this.$refs["chir"];
      this.chirCtx = this.chirCanvas.getContext("2d");
    },
    initGesture(gesture) {
      this.gesture = gesture;
    },
    touch(e) {
      // 使用马赛克笔时
      const { pageX, pageY } = e.touches[0];
      this.$store.commit("setPenCircle", {
        show: true,
        x: pageX,
        y: pageY,
      });

      const { originX, originY, sX, sY } = this.$store.getters["getXy"]({
        pageX,
        pageY,
      });
      this.lastX = originX;
      this.lastY = originY;

      this.draw({ x: originX, y: originY });

      this.startChir(sX, sY);
    },
    slide(e, params) {
      // 使用马赛克笔时
      const { pageX, pageY } = e.touches[0];
      this.$store.commit("setPenCircle", {
        show: true,
        x: pageX,
        y: pageY,
      });
      const { originX, originY, sX, sY } = this.$store.getters["getXy"]({
        pageX,
        pageY,
      });

      this.draw({ x: originX, y: originY });

      this.drawChir(sX, sY);
    },
    finish() {
      // 使用马赛克笔时
      this.$store.commit("setPenCircle", {
        show: false,
        x: 0,
        y: 0,
      });
      this.lastX = 0;
      this.lastY = 0;

      this.$store.commit("addPaintStep");
      this.reRenderImgBox();

      this.closeChir();
    },
    draw({ x, y }) {
      const basic = 0.01;
      const imgBox = this.currPage.pageData.imgBoxList[0];
      const { originWidth, originHeight } = imgBox;
      const maxLength = Math.max(originWidth, originHeight);
      const singleLength = maxLength * basic;

      const drawByPenSize = (penSize) => {
        // 中心点
        const x_n = Math.floor(x / singleLength);
        const y_n = Math.floor(y / singleLength);
        const mosaic_x = x_n * singleLength;
        const mosaic_y = y_n * singleLength;

        if (penSize > 1) {
          // 左上角
          const n_start = penSize - 1;
          const startX = mosaic_x - n_start * singleLength;
          const startY = mosaic_y - n_start * singleLength;

          // 右上角
          const n_end = penSize;
          const endX = mosaic_x + n_end * singleLength;
          const endY = mosaic_y + n_end * singleLength;

          // 整个区域画马赛克
          for (let x = startX; x < endX; x += singleLength) {
            for (let y = startY; y < endY; y += singleLength) {
              this.ctx.fillStyle = this.getPixelColor(x, y).rgba;
              this.ctx.fillRect(x, y, singleLength, singleLength);
            }
          }
        } else {
          this.ctx.fillStyle = this.getPixelColor(x, y).rgba;
          this.ctx.fillRect(mosaic_x, mosaic_y, singleLength, singleLength);
        }
      };
      drawByPenSize(this.penCircle.size);
    },
    getPixelColor(x, y) {
      var imageData = this.ctx.getImageData(x, y, 1, 1);
      var pixel = imageData.data;
      var r = pixel[0];
      var g = pixel[1];
      var b = pixel[2];
      var a = pixel[3] / 255;
      a = Math.round(a * 100) / 100;
      var rHex = r.toString(16);
      r < 16 && (rHex = "0" + rHex);
      var gHex = g.toString(16);
      g < 16 && (gHex = "0" + gHex);
      var bHex = b.toString(16);
      b < 16 && (bHex = "0" + bHex);
      // var rgbaColor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      var rgbaColor = "rgba(" + r + "," + g + "," + b + "," + 0.9 + ")";
      var rgbColor = "rgb(" + r + "," + g + "," + b + ")";
      var hexColor = "#" + rHex + gHex + bHex;
      return {
        rgba: rgbaColor,
        rgb: rgbColor,
        hex: hexColor,
        r: r,
        g: g,
        b: b,
        a: a,
      };
    },
    reRenderImgBox() {
      const base64 = this.canvas.toDataURL();
      this.$store.commit("reRenderImgBox", { src: base64 });
    },
    // 【 开始路径 】
    startChir(sX, sY) {
      this.chirCtx.strokeStyle = "#ffaa40";
      this.chirCtx.lineWidth = 5 * (this.penCircle.size * 2 - 1);
      this.chirCtx.lineCap = "round"; // 线条末端添加圆形线帽，减少线条的生硬感
      this.chirCtx.lineJoin = "round"; // 线条交汇时为原型边角
      this.chirCtx.beginPath();
      this.chirCtx.moveTo(sX, sY);
      this.chirCtx.stroke();
    },
    // 【 实时绘制路径 】
    drawChir(sX, sY) {
      this.chirCtx.lineTo(sX, sY);
      this.chirCtx.stroke();
    },
    closeChir() {
      this.chirCtx.closePath();
      this.chirCtx.clearRect(
        0,
        0,
        this.chirCanvas.width,
        this.chirCanvas.height
      );
    },
  },
  mounted() {
    this.initContext();
  },
  beforeDestroy() {
    this.gesture.destroy();
    this.$store.commit("destroyPintStep");
  },
};
</script>

<style lang="scss">
#paintCanvas {
  position: absolute;
  transform-origin: 0 0;
}
</style>
