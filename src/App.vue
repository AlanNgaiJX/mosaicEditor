<template>
  <div class="masaice_editor">
    <!-- 预览模式下 -->
    <div class="head-bar mode-preview" v-if="mode === 'preview'">
      <div class="btn btn-edit" @click="edit">编辑</div>
    </div>

    <!-- 编辑模式下 -->
    <div class="head-bar mode-edit" v-if="mode === 'edit'">
      <div class="left">
        <div class="steps" v-if="paintStep.isOn">
          <div class="btn-undo" @click="undo" v-show="canUndo"></div>
          <div class="btn-undo-tp" v-show="!canUndo"></div>
          <div class="btn-redo" @click="redo" v-show="canRedo"></div>
          <div class="btn-undo-tp" v-show="!canRedo"></div>
        </div>
      </div>
      <div class="mid"></div>
      <div class="right">
        <div class="btn-cancle" @click="cancle"></div>
        <div class="btn btn-save" @click="save">保存</div>
      </div>
    </div>

    <div class="main-pannel" ref="main-pannel">
      <Editor ref="editor" :page="currPage.pageData"></Editor>
    </div>

    <div class="footer">
      <!-- 图片列表 -->
      <ul class="image-list" v-if="mode === 'preview'">
        <li
          class="image-item"
          :class="{ active: currPage.id === item.id }"
          v-for="item in pages"
          :key="item.id"
          @click="choosePage(item)"
          :style="{
            'background-image': `url(${item.image_url})`,
          }"
        ></li>
      </ul>

      <edit-sidebar v-show="mode === 'edit'"></edit-sidebar>
    </div>
  </div>
</template>

<script>
import Editor from "@/components/editor.vue";
import EditSidebar from "@/components/editSidebar.vue";
import { mapState } from "vuex";

export default {
  name: "masaiceEditor",
  components: {
    Editor,
    EditSidebar,
  },
  data() {
    return {
      mainPannelEl: null,
    };
  },
  computed: {
    ...mapState(["pages", "currPage", "mode", "util", "paintStep"]),
    canUndo() {
      return this.paintStep.isOn && this.paintStep.index > 0;
    },
    canRedo() {
      return (
        this.paintStep.isOn &&
        this.paintStep.index < this.paintStep.queue.length - 1
      );
    },
  },
  methods: {
    init() {
      this.initEditPannel();

      const pages = [
        {
          id: 1,
          image_url: require("@/assets/carTest/1.png"),
        },
        {
          id: 2,
          image_url: require("@/assets/carTest/2.jpg"),
        },
        {
          id: 3,
          image_url: require("@/assets/carTest/3.png"),
        },
        {
          id: 4,
          image_url: require("@/assets/carTest/4.jpg"),
        },
      ];

      if (pages.length) {
        this.initPages(pages);
      }

      this.$store.commit("setMode", { mode: "preview" });
    },
    choosePage(page) {
      this.$store.commit("setCurrPage", { currPage: page });
    },
    initPages(pages) {
      function isAllInited() {
        return pages.every((item) => item.pageData);
      }
      pages.forEach((item) => {
        const img = new Image();

        const imgBox = {
          width: 0,
          height: 0,
          originWidth: 0,
          originHeight: 0,
          canvas: null,
          imageData: null,
          src: "",
        };
        const pageData = {
          width: 0,
          height: 0,
          imgBoxList: [],
          masaiceBoxList: [],
        };

        img.src = item.image_url;
        img.crossOrigin = "*";

        img.onload = (e) => {
          let w = img.width;
          let h = img.height;

          // 过载比
          let o = (w * h) / 2000000;
          // 宽高比
          const ratio = w / h;

          // 画出canvas 得到 imageData
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          // 若过载，调小点
          if (o > 1) {
            console.log("图片超200万像素，过载，将调小");
            o = Math.sqrt(o);
            w /= o;
            h /= o;
          } else {
            o = 1;
          }

          canvas.width = w;
          canvas.height = h;

          let count;
          const tCanvas = document.createElement("canvas");
          const tctx = tCanvas.getContext("2d");

          if ((count = (w * h) / 1000000) > 1) {
            console.log("图片超100万像素，瓦片绘制");
            count = ~~(Math.sqrt(count) + 1);
            const nw = ~~(w / count);
            const nh = ~~(h / count);
            tCanvas.width = nw;
            tCanvas.height = nh;
            for (let i = 0; i < count; i++) {
              for (let j = 0; j < count; j++) {
                tctx.drawImage(
                  img,
                  i * nw * o,
                  j * nh * o,
                  nw * o,
                  nh * o,
                  0,
                  0,
                  nw,
                  nh
                );
                context.drawImage(tCanvas, i * nw, j * nh, nw, nh);
              }
            }
          } else {
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
          }

          imgBox.canvas = canvas;
          imgBox.src = canvas.toDataURL();
          imgBox.imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          // 这个其实也不绝对是图片最原始的宽，譬如过载后会调小点
          imgBox.originWidth = w;
          imgBox.originHeight = h;

          // 计算展示宽高
          const mainPannelEl = this.$refs["main-pannel"];
          const editorW = mainPannelEl.clientWidth;
          const editorH = mainPannelEl.clientHeight;

          if (w > h) {
            pageData.width = imgBox.width = editorW;
            pageData.height = imgBox.height = editorW / ratio;
            // pageData.x = 0;
            // pageData.y = (editorH - editorW / ratio) / 2;
          } else {
            const assumedHeight = editorH;
            const assumedWidth = assumedHeight * ratio;

            if (assumedWidth > editorW) {
              pageData.width = imgBox.width = editorW;
              pageData.height = imgBox.height = editorW / ratio;
              // pageData.x = 0;
              // pageData.y = (editorH - editorW / ratio) / 2;
            } else {
              pageData.height = imgBox.height = assumedHeight;
              pageData.width = imgBox.width = assumedWidth;
              // pageData.x = (editorW - assumedWidth) / 2;
              // pageData.y = 0;
            }
          }
          pageData.imgBoxList.push(imgBox);
          item.pageData = pageData;

          if (isAllInited()) {
            console.log("全部加载好了");
            this.$store.commit("setPages", { pages });
            this.choosePage(pages[0]);
          }
        };
      });
    },
    initEditPannel() {
      this.mainPannelEl = this.$refs["main-pannel"];
      setTimeout(() => {
        const {
          offsetWidth,
          offsetHeight,
          offsetTop,
          offsetLeft,
        } = this.mainPannelEl;
        this.$store.commit("changeEditPannel", {
          wrap: {
            x: offsetLeft,
            y: offsetTop,
            w: offsetWidth,
            h: offsetHeight,
          },
        });
        console.log(offsetWidth, offsetHeight, offsetTop, offsetLeft);
      }, 0);
    },
    edit() {
      this.$store.commit("setMode", { mode: "edit" });
    },
    save() {
      this.$store.commit("setMode", { mode: "preview" });
      this.$store.commit("setUtil", { util: "resize" });
      this.$store.commit("resetPannel");
      const canvas = this.currPage.pageData.imgBoxList[0].canvas;
    },
    cancle() {
      this.$store.commit("setMode", { mode: "preview" });
      this.$store.commit("setUtil", { util: "resize" });
      this.$store.commit("resetPannel");
      this.$store.commit("resetImgBox");
    },
    undo() {
      this.$store.commit("undoStep");
    },
    redo() {
      this.$store.commit("redoStep");
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss">
.masaice_editor {
  .head-bar {
    height: 0.8rem;
    position: fixed;
    top: 0;
    width: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 0.2rem;

    .btn {
      width: 0.8rem;
      height: 0.5rem;
      background-color: #409eff;
      color: #fff;
      font-size: 0.24rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
    }

    &.mode-preview {
      justify-content: flex-end;

      .btn-edit {
      }
    }

    &.mode-edit {
      justify-content: space-between;

      .left {
        display: flex;
        align-items: center;

        .steps {
          display: flex;
          align-items: center;

          .btn-undo {
            width: 0.6rem;
            height: 0.6rem;
            background-image: url("~@/assets/icon/icon-undo-default.png");
            background-repeat: no-repeat;
            background-size: 65%;
            background-position: center;
          }

          .btn-redo {
            width: 0.6rem;
            height: 0.6rem;
            background-image: url("~@/assets/icon/icon-redo-default.png");
            background-repeat: no-repeat;
            background-size: 65%;
            background-position: center;
            margin-left: 0.2rem;
          }

          .btn-undo-tp,
          btn-redo-tp {
            width: 0.6rem;
            height: 0.6rem;
          }
        }
      }

      .right {
        display: flex;
        align-items: center;

        .btn-cancle {
          width: 0.6rem;
          height: 0.6rem;
          background-image: url("~@/assets/icon/icon-cancle.png");
          background-repeat: no-repeat;
          background-size: 65%;
          background-position: center;
          margin-right: 0.3rem;
        }

        .btn-save {
        }
      }
    }
  }

  .main-pannel {
    position: fixed;
    top: 0.8rem;
    bottom: 2rem;
    width: 100%;
  }

  .footer {
    position: fixed;
    bottom: 0;
    background-color: #eee;
    width: 100%;
    height: 2rem;
    box-sizing: border-box;
    border-top: 1px solid rgb(207, 207, 207);

    .image-list {
      display: flex;
      padding: 0.2rem;

      .image-item {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 4px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        margin-right: 0.2rem;
        border: 2px solid #fff;
        border-radius: 4px;

        &.active {
          border: 2px solid #409eff;
        }
      }
    }
  }
}
</style>
