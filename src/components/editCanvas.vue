<template>
  <div id="editCanvas" ref="editCanvas" :style="editCanvasStyle">
    <Page :page="page"></Page>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Page from "@/components/page.vue";

export default {
  name: "editCanvas",
  components: {
    Page,
  },
  props: {
    page: {
      type: Object,
      require: true,
    },
  },
  computed: {
    ...mapState(["editPannel"]),
    editCanvasStyle() {
      const { w, h, x, y, scale } = this.editPannel;
      return {
        width: w + "px",
        height: h + "px",
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
      };
    },
  },
};
</script>

<style lang="scss">
#editCanvas {
  position: absolute;
  transform-origin: 0 0;
}
</style>
