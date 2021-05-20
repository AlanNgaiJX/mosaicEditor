export default {
  install(Vue, canvasScale = 1) {
    Vue.prototype.AutoCanvas = function(args) {
      var el = args.el || document.body, //编辑区域相对某层的比例
        w = args.w, //编辑区域宽度
        h = args.h, //编辑区域高度
        zoomScale = args.zoomScale || null, //新的缩放量
        lastInfo = args.lastInfo, //缩放前的数据
        mouseXy = args.mouseXy, //鼠标滚动时的坐标
        callback = args.callback,
        _canvasScale = args.canvasScale || canvasScale;

      var elW = el.clientWidth,
        elH = el.clientHeight;

      var scaleW = elW / w,
        scaleH = elH / h;

      var scale = scaleW < scaleH ? scaleW : scaleH;

      //编辑区域的缩放倍数 * 占编辑画布的缩放倍数 + 缩放的量
      var _scale = zoomScale ? zoomScale : scale * _canvasScale;

      var offsetX, offsetY;

      if (lastInfo) {
        offsetX = lastInfo.x + ((lastInfo.scale - _scale) * w) / 2;
        offsetY = lastInfo.y + ((lastInfo.scale - _scale) * h) / 2;

        if (mouseXy) {
          //((新倍数 / 上一次的倍数) - 1) * (鼠标位置跟缩放中心的距离)
          var _offsetX =
              (_scale / lastInfo.scale - 1) *
              (mouseXy.x - (offsetX + (w * _scale) / 2) - el.offsetLeft),
            _offsetY =
              (_scale / lastInfo.scale - 1) *
              (mouseXy.y - (offsetY + (h * _scale) / 2) - el.offsetTop);

          offsetX = offsetX - _offsetX;
          offsetY = offsetY - _offsetY;
        }
      } else {
        offsetX = (elW - w * _scale) / 2;
        offsetY = (elH - h * _scale) / 2;
      }

      if (typeof callback === "function") {
        callback({
          scale: _scale,
          offset: {
            x: offsetX,
            y: offsetY,
          },
        });
      }
    };

    Vue.prototype.WheelFocusZoom = function(args){
      var el = args.el || document.body,//编辑区域相对某层的比例
        w = args.w,//编辑区域宽度
        h = args.h,//编辑区域高度
        x = args.x,
        y = args.y,
        scale = args.scale,//新的缩放比例
        lastScale = args.lastScale,//上次的缩放比例
        mouseXy = args.mouseXy,//鼠标滚动时的坐标
        callback = args.callback;

        var elRect = el.getBoundingClientRect();

        var offsetX = x + (lastScale - scale) * w / 2,
        offsetY = y + (lastScale - scale) * h / 2;

        //((新倍数 / 上一次的倍数) - 1) * (鼠标位置跟缩放中心的距离)
        var _offsetX = (scale / lastScale - 1) * (mouseXy.x - (offsetX + w * scale / 2) - elRect.left),
          _offsetY = (scale / lastScale - 1) * (mouseXy.y - (offsetY + h * scale / 2) - elRect.top);

      if (typeof callback === 'function') {
        callback({
          scale: scale,
          offset: {
            x: offsetX - _offsetX,
            y: offsetY - _offsetY
          }
        })
      }
    }
  },
};
