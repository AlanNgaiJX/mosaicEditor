<template>
  <div
    id="page"
    :style="pageStyle"
  >
    <imgBox v-for="item in imgBoxList" :key="item.id" :imgBox="item"></imgBox>
  </div>
</template>

<script>
import ImgBox from "@/components/imgBox.vue";

export default {
  name: "page",
  components: {
    ImgBox,
  },
  props: {
    page: {
      type: Object,
      require: true,
    },
  },
  computed: {
    imgBoxList() {
      return this.page.imgBoxList;
    },
    pageStyle() {
      const { width, height, x, y } = this.page;
      return {
        width: width + "px",
        height: height + "px",
        transform: `translate(${x}px, ${y}px)`,
      };
    },
  },
};
</script>
<style lang="scss">
#page {
  position: relative;
  z-index: 1;
  overflow: hidden;

  .box {
    position: absolute;
    border: 0;
  }
}
</style>
