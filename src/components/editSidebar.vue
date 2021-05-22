<template>
  <div class="edit-sidebar">
    <div class="pannel">
      <div class="tips-pannel" v-show="util === 'resize'">
        双指缩放，单指挪动
      </div>
      <div class="pen-size-pannel" v-show="util === 'mosaic'">
        <ul class="size-list">
          <li
            v-for="item in penSizeList"
            :key="item.id"
            :class="{ active: item.id === penCircle.id }"
            @click="setPenSize(item.id, item.size)"
          ></li>
        </ul>
        <div class="icon-pen"></div>
      </div>
    </div>
    <div class="sidebar">
      <ul class="sidebar-list">
        <li
          class="sidebar-item resize"
          :class="{ active: util === 'resize' }"
          @click="chooseUtil('resize')"
        >
          <div class="icon icon-resize"></div>
          <div class="text">移动/放大</div>
        </li>
        <li
          class="sidebar-item mosaic"
          :class="{ active: util === 'mosaic' }"
          @click="chooseUtil('mosaic')"
        >
          <div class="icon icon-mosaic"></div>
          <div class="text">马赛克</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "edit-sidebar",
  data() {
    return {
      penSizeList: [
        { id: 1, size: 1 },
        { id: 2, size: 2 },
        { id: 3, size: 3 },
      ],
    };
  },
  computed: {
    ...mapState(["util", "penCircle"]),
  },
  methods: {
    setPenSize(id, size) {
      this.$store.commit("setPenCircle", { id, size });
    },
    chooseUtil(util) {
      this.$store.commit("setUtil", { util });
    },
  },
  mounted() {
    const pen = this.penSizeList[1];
    const { id, size } = pen;
    this.setPenSize(id, size);
  },
};
</script>

<style lang="scss">
.edit-sidebar {
  width: 100%;
  height: 100%;
  background-color: #fff;

  .pannel {
    height: 0.8rem;
    position: relative;

    .tips-pannel {
      font-size: 0.24rem;
      color: #999;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .pen-size-pannel {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .size-list {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 2.5rem;

        li {
          width: 0.4rem;
          height: 0.4rem;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;

          &::before {
            position: relative;
            z-index: 2;
            content: "";
            display: block;
            border-radius: 100%;
            background-color: #ccc;
          }

          &:nth-child(-n + 2) {
            &::after {
              content: "";
              display: block;
              width: 1rem;
              height: 4px;
              background-color: #ccc;
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
            }
          }

          &:nth-child(1) {
            &:before {
              width: 0.2rem;
              height: 0.2rem;
            }
            &:after {
              left: 0.2rem;
            }
          }

          &:nth-child(2) {
            &:before {
              width: 0.25rem;
              height: 0.25rem;
            }
            &:after {
              left: 0.25rem;
            }
          }

          &:nth-child(3) {
            &:before {
              width: 0.3rem;
              height: 0.3rem;
            }
            &:after {
              left: 0.3rem;
            }
          }

          &.active {
            &::before {
              background-color: #409eff;
            }
          }
        }
      }

      .icon-pen {
        width: 0.6rem;
        height: 0.6rem;
        background-image: url("~@/assets/icon-pen.png");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        margin-left: 0.3rem;
      }
    }
  }
  .sidebar {
    height: 1.2rem;

    .sidebar-list {
      display: flex;
      font-size: 0.26rem;
      position: relative;
      height: 100%;
      padding-top: 0.1rem;
      padding-bottom: 0.1rem;
      padding-left: 0.2rem;
      border-top: 1px solid #eee;

      .sidebar-item {
        width: 1.5rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-right: 0.1rem;
        border-radius: 0.2rem;
        background-color: transparent;
        transition: all 0.3s;

        .icon {
          width: 0.5rem;
          height: 0.5rem;
          margin-bottom: 0.1rem;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;

          &.icon-resize {
            background-image: url("~@/assets/icon-resize.png");
          }

          &.icon-mosaic {
            background-image: url("~@/assets/icon-mosaic.png");
          }
        }

        .text {
          color: #333;
        }

        &.active {
          background-color: #40a0ff10;

          .icon {
            &.icon-resize {
              background-image: url("~@/assets/icon-resize-active.png");
            }

            &.icon-mosaic {
              background-image: url("~@/assets/icon-mosaic-active.png");
            }
          }

          .text {
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>
