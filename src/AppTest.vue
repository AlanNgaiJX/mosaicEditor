<template>
  <div id="app">
    <div
      class="wrap"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    >
      <canvas id="canvas" width="750" height="460" ref="canvas"></canvas>
    </div>

    <div class="data-pannel"></div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      src: require("@/assets/1.png"),
      context: null,
      imageData: null,
      isDrawing: false,
      mosaicSize: 10,
      lastX: 0,
      lastY: 0,
    };
  },
  components: {},
  methods: {
    init() {
      const canvas = this.$refs["canvas"];
      const _canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const _context = _canvas.getContext("2d");

      this.context = context;
      this._context = _context;

      let img = new Image();
      img.src = this.src;
      img.crossOrigin = "*";
      img.onload = () => {
        _canvas.width = img.width;
        _canvas.height = img.height;

        canvas.width = img.width;
        canvas.height = img.height;

        _context.drawImage(img, 0, 0);

        const imageData = _context.getImageData(
          0,
          0,
          _canvas.width,
          _canvas.height
        );

        this.draw(context, _context, _canvas, imageData);

        this.imageData = imageData;
      };
    },
    draw(context, _context, _canvas, imageData) {
      const mosaicSize = 20;
      this.createMosaic(
        _context,
        _canvas.width,
        _canvas.height,
        mosaicSize,
        imageData
      );
      context.drawImage(_canvas, 0, 0);
    },
    createMosaic(_context, width, height, size, data) {
      for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
          /**
           * 取出像素的r,g,b,a值
           */
          let cR = data.data[(y * width + x) * 4],
            cG = data.data[(y * width + x) * 4 + 1],
            cB = data.data[(y * width + x) * 4 + 2];
          // _context.fillStyle = `rgb(${cR},${cG},${cB})`;
          // _context.fillRect(x, y, x + size, y + size);
        }
      }
    },
    handleMouseDown(e) {
      const x = e.offsetX;
      const y = e.offsetY;
      console.log(`mouse down --- x：${x}, y：${y}`);
      this.isDrawing = true;
      this.context.fillStyle = this.getMosaicColor(x, y);
      this.context.fillRect(x, y, this.mosaicSize, this.mosaicSize);
      this.lastX = x;
      this.lastY = y;
    },
    handleMouseMove(e) {
      if (this.isDrawing) {
        const x = e.offsetX;
        const y = e.offsetY;
        if (
          Math.abs(x - this.lastX) >= this.mosaicSize ||
          Math.abs(y - this.lastY) >= this.mosaicSize
        ) {
          this.context.fillStyle = this.getMosaicColor(x, y);
          this.context.fillRect(x, y, this.mosaicSize, this.mosaicSize);
          this.lastX = x;
          this.lastY = y;
        }
      }
    },
    handleMouseUp(e) {
      this.isDrawing = false;
      this.lastX = 0;
      this.lastY = 0;
    },
    getMosaicColor(x, y) {
      const cR = this.imageData.data[(y * this.imageData.width + x) * 4];
      const cG = this.imageData.data[(y * this.imageData.width + x) * 4 + 1];
      const cB = this.imageData.data[(y * this.imageData.width + x) * 4 + 2];
      const cA = this.imageData.data[(y * this.imageData.width + x) * 4 + 3];
      return `rgba(${cR},${cG},${cB}, ${cA})`;
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss">
.wrap {
  width: 750px;
  height: 460px;
  position: relative;
}
</style>
