<template>
  <div class="pen-circle-wrap" v-show="penCircle.show" :style="penCircleStyle">
    <div class="pen-circle"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "pen-circle",
  computed: {
    ...mapState(["penCircle"]),
    penCircleStyle() {
      const { x, y } = this.penCircle;
      return {
        transform: `translate(${x}px, ${y}px)`,
      };
    },
  },
};
</script>

<style lang="scss">
.pen-circle-wrap {
  width: 1px;
  height: 1px;
  position: fixed;
  left: 0;
  top: 0;

  .pen-circle {
    width: 0.5rem;
    height: 0.5rem;
    background-color: red;
    transform: translate(-50%, -50%);
    border-radius: 100%;
    box-sizing: border-box;
    border: 2px solid #eee;
    background-color: rgba(0, 0, 0, 0.5);
  }
}
</style>
