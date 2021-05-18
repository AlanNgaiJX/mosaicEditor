<template>
  <div class="masaice_editor">
    <div class="head-bar mode-a" v-show="true">
      <div class="btn btn-edit">编辑</div>
    </div>
    <div class="head-bar mode-b" v-show="false">
      <div class="left">
        <div class="btn btn-undo">撤销</div>
        <div class="btn btn-redo">重做</div>
      </div>
      <div class="mid"></div>
      <div class="right">
        <div class="btn btn-save">保存</div>
      </div>
    </div>
    <div class="main-pannel" ref="main-pannel">
      <div class="mode-preview" ref="preview" v-if="mode === 'preview'">
        <img
          :src="currImg.image_url"
          v-if="currImg"
          v-show="currImgLoaded"
          :style="preImgStyle"
        />
      </div>
      <div class="mode-edit" ref="edit" v-if="mode === 'edit'"></div>
    </div>
    <div class="footer">
      <ul class="image-list">
        <li
          class="image-item"
          :class="{ active: currImg && img.id === currImg.id }"
          v-for="img in imgs"
          :key="img.id"
          @click="chooseImage(img)"
          :style="{
            'background-image': `url(${img.image_url})`,
          }"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "masaiceEditor",
  data() {
    return {
      mode: "preview",
      imgs: [],
      currImg: null,
      currImgLoaded: false,
      mainPannelEl: null,
      previewPannelEl: null,
      editPannelEl: null,
      preImgStyle: {},
    };
  },
  watch: {
    currImg(currImg) {
      const img = new Image();
      this.currImgLoaded = false;
      this.preImgStyle = {};

      img.onload = (e) => {
        const w = e.target.width;
        const h = e.target.height;
        const ratio = w / h;

        const pannelW = this.mainPannelEl.clientWidth;
        const pannelH = this.mainPannelEl.clientHeight;

        if (w > h) {
          this.preImgStyle.width = pannelW + "px";
          this.preImgStyle.height = pannelW / ratio + "px";
          this.preImgStyle.transform = `translate(0,${(pannelH -
            pannelW / ratio) /
            2 +
            "px"})`;
        } else {
          this.preImgStyle.height = pannelH + "px";
          this.preImgStyle.width = pannelH * ratio + "px";
          this.preImgStyle.transform = `translate(${(pannelW -
            pannelH * ratio) /
            2 +
            "px"},0)`;
        }

        this.currImgLoaded = true;
      };
      img.src = currImg.image_url;
      img.crossOrigin = "*";
    },
  },
  methods: {
    init() {
      const imgs = [
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
        }
      ];
      if (imgs.length) {
        this.chooseImage(imgs[0]);
        this.imgs = imgs;
      }

      this.mainPannelEl = this.$refs["main-pannel"];
    },
    chooseImage(img) {
      this.currImg = JSON.parse(JSON.stringify(img));
      console.log(this.currImg);
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
    background-color: red;
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

    &.mode-a {
      justify-content: flex-end;

      .btn-edit {
      }
    }

    &.mode-b {
      justify-content: space-between;

      .left {
        display: flex;
      }
      .btn-save {
      }
    }
  }

  .main-pannel {
    position: fixed;
    top: 0.8rem;
    bottom: 2rem;
    width: 100%;
    background-color: pink;

    .mode-preview {
      background-color: #eee;
      width: 100%;
      height: 100%;
      position: relative;

      img {
        // position: absolute;
      }
    }
  }

  .footer {
    padding: 0.2rem;
    position: fixed;
    bottom: 0;
    background-color: #eee;
    width: 100%;
    height: 2rem;
    box-sizing: border-box;
    border-top: 1px solid rgb(207, 207, 207);

    .image-list {
      display: flex;

      .image-item {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 4px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        margin-right: 0.2rem;
        border: 2px solid transparent;
        border-radius: 4px;

        &.active {
          border: 2px solid #409eff;
        }
      }
    }
  }
}
</style>
