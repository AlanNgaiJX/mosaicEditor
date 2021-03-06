<template>
  <div
    class="editor"
    id="editor"
    v-Gesture="{
      touch: e_touch,
      tap: e_tap,
      slide: e_slide,
      pinch: e_pinch,
      finish: e_finish,
    }"
    :style="{
      'background-color': mode === 'edit' ? '#000' : '#eee',
    }"
  >
    <EditCanvas :page="page"></EditCanvas>
    <PaintCanvas v-if="showPaintCanvas"></PaintCanvas>
    <pen-circle></pen-circle>
  </div>
</template>

<script>
import { mapState } from "vuex";
import EditCanvas from "@/components/editCanvas";
import PaintCanvas from "@/components/paintCanvas";
import PenCircle from "@/components/penCircle";

export default {
  name: "editor",
  components: {
    EditCanvas,
    PaintCanvas,
    PenCircle,
  },
  props: {
    page: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      editorConfig: {
        minScale: 1,
        maxScale: 5,
      },
    };
  },
  computed: {
    ...mapState(["editPannel", "mode", "util"]),
    showPaintCanvas() {
      return this.mode === "edit" && this.util === "mosaic";
    },
  },
  methods: {
    e_touch(e) {
      console.log("touch editor");
    },
    e_tap() {
      console.log("tap editor");
    },
    e_slide(e, params, el) {
      // 在预览或者挪动工具中可挪动画布
      if (this.mode === "preview" || this.util === "resize") {
        if (this.editPannel.scale === this.editorConfig.minScale) {
          // 限制没有缩放过不给挪动
          return;
        }

        const { deltaX, deltaY } = params;
        this.$store.commit("changeEditPannel", {
          x: this.editPannel.x + deltaX,
          y: this.editPannel.y + deltaY,
        });
      }
    },
    e_pinch(e, params, el, initscale) {
      if (this.mode === "preview" || this.util === "mosaic") {
        // 限制预览和马赛克笔时不给双指缩放
        return;
      }
      const minScale = this.editorConfig.minScale;
      const maxScale = this.editorConfig.maxScale;

      const center = params.centerXy;

      // 方案一
      // const zoom = params.zoom;
      // const offsetScale = zoom > 1 ? 0.02 * zoom : -0.1 * zoom;
      // let newScale = this.editPannel.scale + offsetScale;

      // 方案二
      const deltaZoom = params.deltaZoom;
      let newScale =
        deltaZoom > 0
          ? this.editPannel.scale + deltaZoom
          : this.editPannel.scale + 3 * deltaZoom;

      if (newScale < minScale) {
        newScale = minScale;
      }

      if (newScale > maxScale) {
        newScale = maxScale;
      }

      if (newScale === minScale) {
        this.$store.commit("resetPannel");
        return;
      }

      this.$store.commit("pinchPannel", {
        newScale,
        mouseXy: center,
      });
    },
    e_finish() {},
  },
};
</script>

<style lang="scss">
.editor {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #eee;
  overflow: hidden;
  transition: background-color 0.3s;
}
</style>
