<template>
  <div class="box imgBox">
    <div class="img-content" :style="imgBoxStyle" ref="imgContent">
      <img class="image" :src="imgBox.src" />
    </div>
  </div>
</template>

<script>
export default {
  name: "imgBox",
  props: {
    imgBox: {
      type: Object,
      require: true,
    },
  },
  computed: {
    imgBoxStyle() {
      const { width, height, zIndex, x, y } = this.imgBox;
      return {
        width: width + "px",
        height: height + "px",
        zIndex: zIndex,
        transform: `translate(${x}px, ${y}px)`,
      };
    },
  },
  methods: {
  },
  mounted(){
    console.log(this.imgBox);
  }
};
</script>

<style lang="scss">
.imgBox {
  position: absolute;

  .img-content {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    left: 0;
    top: 0;

    .image {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
