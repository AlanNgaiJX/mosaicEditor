<template>
  <div
    id="paintCanvas"
    class="paintCanvas"
    ref="paintCanvas"
    :style="paintCanvasStyle"
    v-Gesture.stop="{
      touch,
      slide,
      finish,
    }"
  ></div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "paintCanvas",
  data() {
    return {
      canvas: null,
      ctx: null,
      imageData: null,
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
      const { canvas, imageData } = this.currPage.pageData.imgBoxList[0];
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.imageData = imageData;
      this.$store.commit("initPaintStep");
    },
    initPen() {
      const basicPercent = this.penCircle.basicPercent;
      const {
        originWidth,
        originHeight,
      } = this.currPage.pageData.imgBoxList[0];
      const maxWidth = Math.max(originWidth, originHeight);
      this.$store.commit("setPenCircle", {
        basicSize: maxWidth * basicPercent,
      });
    },
    touch(e) {
      // 使用马赛克笔时
      const { pageX, pageY } = e.touches[0];
      this.$store.commit("setPenCircle", {
        show: true,
        x: pageX,
        y: pageY,
      });

      const { originX, originY } = this.$store.getters["getOriginXy"]({
        pageX,
        pageY,
      });
      this.lastX = originX;
      this.lastY = originY;

      this.draw({ x: originX, y: originY, start: true });
    },
    slide(e, params) {
      // 使用马赛克笔时
      const { pageX, pageY } = e.touches[0];
      this.$store.commit("setPenCircle", {
        show: true,
        x: pageX,
        y: pageY,
      });
      const { originX, originY } = this.$store.getters["getOriginXy"]({
        pageX,
        pageY,
      });

      this.draw({ x: originX, y: originY });
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
    },
    draw({ x, y, start }) {
      const { basicSize, size } = this.penCircle;
      const mosaiceSize = basicSize * size;

      const drawAMasaice = () => {
        this.ctx.fillStyle = this.getPixelColor(x, y).rgba;
        this.ctx.fillRect(
          x - mosaiceSize / 2,
          y - mosaiceSize / 2,
          mosaiceSize,
          mosaiceSize
        );
        this.lastX = x;
        this.lastY = y;
      };

      if (start) {
        drawAMasaice();
      } else {
        if (
          Math.abs(x - this.lastX) >= mosaiceSize ||
          Math.abs(y - this.lastY) >= mosaiceSize
        ) {
          drawAMasaice();
        }
      }
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
      var rgbaColor = "rgba(" + r + "," + g + "," + b + "," + 0.85 + ")";
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
  },
  mounted() {
    this.initContext();
    this.initPen();
  },
  beforeDestroy() {
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
