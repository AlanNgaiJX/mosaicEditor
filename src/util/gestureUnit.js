/* eslint-disable */
; (function () {
    var ABS = Math.abs;
    var isTarget = function (obj, selector) {
        while (obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY') {
            if (obj.matches(selector)) {
                return obj;
            }
            obj = obj.parentNode;
        }
        return null;
    }
    var calcLen = function (v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    var calcAngle = function (a, b) {
        var l = calcLen(a) * calcLen(b), cosValue, angle;
        if (l) {
            cosValue = (a.x * b.x + a.y * b.y) / l;
            angle = Math.acos(Math.min(cosValue, 1))
            angle = a.x * b.y - b.x * a.y > 0 ? -angle : angle;
            return angle * 180 / Math.PI;
        }
        return 0;
    }
    function Gesture(target, selector) {
        this.target = target instanceof HTMLElement ? target : typeof target === "string" ? document.querySelector(target) : null;
        if (!this.target) return;
        this.selector = selector;
        this._init();
        this.pretouch = {};
        this.handles = {};
        this.preVector = { x: null, y: null }
        this.distance = 30;
        this.stopPropagation = false;
        this.preventDefault = false;
        this.longtapTime = 0;
        this.longTapTimeout = null;
        this.tapTimeout = null;
        this._touch = this._touch.bind(this);
        this._move = this._move.bind(this);
        this._end = this._end.bind(this);
        this._cancel = this._cancel.bind(this);
        this.target.addEventListener('touchstart', this._touch, false);
        this.target.addEventListener('touchmove', this._move, false);
        this.target.addEventListener('touchend', this._end, false);
        this.target.addEventListener('touchcancel', this._cancel, false);
    }
    Gesture.prototype = {
        _touch: function (e) {
            this.stopPropagation ? e.stopPropagation() : '';
            this.preventDefault ? e.preventDefault() : '';
            this.e = e.target;
            var point = e.touches ? e.touches[0] : e;
            var now = Date.now();
            this.touch.startX = point.pageX;
            this.touch.startY = point.pageY;
            this.touch.startTime = now;
            this.longTapTimeout && clearTimeout(this.longTapTimeout);
            this.tapTimeout && clearTimeout(this.tapTimeout);
            this.doubleTap = false;
            this._emit('touch', e);
            if (e.touches.length > 1) {
                var point2 = e.touches[1];
                this.preVector = { x: point2.pageX - this.touch.startX, y: point2.pageY - this.touch.startY }
                this.startDistance = calcLen(this.preVector);
                this._emit('multitouch', e);
            } else {
                this.longTapTimeout = setTimeout( ()=> {
                    this._emit('longtap', e);
                    this.doubleTap = false;
                    e.preventDefault();
                }, ~~this.longtapTime || 800);
                this.doubleTap = this.pretouch.time && now - this.pretouch.time < 300 && ABS(this.touch.startX - this.pretouch.startX) < 30 && ABS(this.touch.startY - this.pretouch.startY) < 30 && ABS(this.touch.startTime - this.pretouch.time) < 300;
                this.pretouch = {//reserve the last touch
                    startX: this.touch.startX,
                    startY: this.touch.startY,
                    time: this.touch.startTime
                };
            }
        },
        _move: function (e) {
            this.stopPropagation ? e.stopPropagation() : '';
            this.preventDefault ? e.preventDefault() : '';
            var point = e.touches ? e.touches[0] : e;
            this._emit('move', e);
            if (e.touches.length > 1) {//multi touch
                var point2 = e.touches[1];
                var v = { x: point2.pageX - point.pageX, y: point2.pageY - point.pageY };
                this._emit('multimove', e);
                if (this.preVector.x !== null) {
                    if (this.startDistance) {
                        this.params.zoom = calcLen(v) / this.startDistance;
                        this.params.deltaZoom =( calcLen(v) - calcLen(this.preVector) )/ this.startDistance;
                        this.params.centerXy = {x: (point2.pageX + point.pageX) / 2, y: (point2.pageY + point.pageY) /2};
                        this._emit('pinch', e);
                    }
                    this.params.angle = calcAngle(v, this.preVector);
                    this._emit('rotate', e);
                }
                this.preVector.x = v.x;
                this.preVector.y = v.y;
            } else {
                var diffX = point.pageX - this.touch.startX,
                    diffY = point.pageY - this.touch.startY
                this.params.diffY = diffY;
                this.params.diffX = diffX;
                if (this.movetouch.x) {
                    this.params.deltaX = point.pageX - this.movetouch.x;
                    this.params.deltaY = point.pageY - this.movetouch.y;
                } else {
                    this.params.deltaX = this.params.deltaY = 0;
                }
                if (ABS(diffX) > 30 || ABS(diffY) > 30) {
                    this.longTapTimeout && clearTimeout(this.longTapTimeout);
                    this.tapTimeout && clearTimeout(this.tapTimeout);
                    this.doubleTap = false;
                }
                this._emit('slide', e);
                this.movetouch.x = point.pageX;
                this.movetouch.y = point.pageY;
            }
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        },
        _end: function (e) {
            this.stopPropagation ? e.stopPropagation() : '';
            this.preventDefault ? e.preventDefault() : '';
            this.longTapTimeout && clearTimeout(this.longTapTimeout);
            var timestamp = Date.now();
            var deltaX = ~~((this.movetouch.x || 0) - this.touch.startX),
                deltaY = ~~((this.movetouch.y || 0) - this.touch.startY);
            var direction = '';
            this._emit('end', e);
            if (this.movetouch.x && (ABS(deltaX) > this.distance || this.movetouch.y !== null && ABS(deltaY) > this.distance)) {//swipe happened
                if (ABS(deltaX) < ABS(deltaY)) {//swipeup and swipedown,but it generally used as a scrolling window
                    if (deltaY < 0) {
                        this._emit('swipeUp', e)
                        this.params.direction = 'up';
                    } else {
                        this._emit('swipeDown', e);
                        this.params.direction = 'down';
                    }
                } else {
                    if (deltaX < 0) {
                        this._emit('swipeLeft', e);
                        this.params.direction = 'left';
                    } else {
                        this._emit('swipeRight', e);
                        this.params.direction = 'right';
                    }
                }
                this._emit('swipe', e);
                this._emit("finish", e);
            }
             else {
                if (!this.doubleTap && timestamp - this.touch.startTime < 300) {
                    console.log("???");
                    this.tapTimeout = setTimeout(()=> {
                        this._emit('tap', e);
                        this._emit("finish", e);
                    }, 300);
                } else if (this.doubleTap) {
                    this._emit('dbtap', e);
                    this.tapTimeout && clearTimeout(this.tapTimeout);
                    this._emit("finish", e);
                } else {
                    this._emit("finish", e);
                }
            }
            this._init();
            this.preVector = { x: 0, y: 0 }
        },
        _cancel: function (e) {
            this.stopPropagation ? e.stopPropagation() : '';
            this.preventDefault ? e.preventDefault() : '';
            this._emit('cancel', e);
            this._end();
        },
        _emit: function (type, e) {
            !this.handles[type] && (this.handles[type] = []);
            var currentTarget = isTarget(this.e, this.selector);
            if (currentTarget || !this.selector) {
                this.selector && (this.params.selector = currentTarget);
                for (var i = 0, len = this.handles[type].length; i < len; i++) {
                    typeof this.handles[type][i] === 'function' && this.handles[type][i](e, this.params);
                }
            }
            return true;
        },
        on: function (type, callback) {
            !this.handles[type] && (this.handles[type] = []);
            this.handles[type].push(callback);
            return this;
        },
        off: function (type) {
            this.handles[type] = [];
        },
        destroy: function () {
            this.longTapTimeout && clearTimeout(this.longTapTimeout);
            this.tapTimeout && clearTimeout(this.tapTimeout);
            this.target.removeEventListener('touchstart', this._touch);
            this.target.removeEventListener('touchmove', this._move);
            this.target.removeEventListener('touchend', this._end);
            this.target.removeEventListener('touchcancel', this._cancel);
            this.params = this.handles = this.movetouch = this.pretouch = this.touch = this.longTapTimeout = null;
            console.log("destroy");
            return false;
        },
        set: function (setting,modifiers) {
            for (var i in setting) {
                if (i === 'distance') this.distance = ~~setting[i];
                if (i === 'longtapTime') this.longtapTime = Math.max(500, ~~setting[i]);
            }
            for (var i in modifiers) {
                if (i === 'stop' && modifiers[i] === true) this.stopPropagation = true;
                if (i === 'prevent' && modifiers[i] === true) this.preventDefault = true;
            }
            return this;
        },
        _init: function () {
            this.touch = {};
            this.movetouch = {}
            this.params = { zoom: 1, deltaX: 0, deltaY: 0, diffX: 0, diffY: 0, angle: 0, direction: '' };
        }
    }
    Gesture.prototype.constructor = Gesture;
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Gesture;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return Gesture; });
    } else {
        window.GT = Gesture;
    }
})();

function bindingEvent(el, binding) {
    var { name, arg, modifiers, value, vnode, expression } = binding;

    if (value.disable) {
        return;
    }
    
    var initscale = 1;

    var theGt = new GT(el).set(value.setting || {}, modifiers)
    .on('init', function(){
        value.init && typeof value.init === 'function' && value.init(theGt);
    }).on('tap', function (e, params) {
        value.tap && typeof value.tap === 'function' && value.tap(e, params, el);
    }).on('touch', function (e, params) {
        function getInitscale(el) {
            var scale = 1;
            if (el.style && el.style.transform && el.style.transform.includes('scale(')) {
                var right = el.style.transform.split('scale(')[1];
                scale = right.split(')')[0]
            }
            return scale;
        }
        initscale = getInitscale(el);
        value.touch && typeof value.touch === 'function' && value.touch(e, params, el);
    }).on('dbtap', function (e, params) {
        value.dbtap && typeof value.dbtap === 'function' && value.dbtap(e, params, el);
    }).on("longtap", function (e, params) {
        value.longtap && typeof value.longtap === 'function' && value.longtap(e, params, el);
    }).on('slide', function (e, params) {
        e.preventDefault()
        value.slide && typeof value.slide === 'function' && value.slide(e, params, el);
    }).on('swipeUp', function (e, params) {
        value.swipeUp && typeof value.swipeUp === 'function' && value.swipeUp(e, params, el);
    }).on('swipeDown', function (e, params) {
        value.swipeDown && typeof value.swipeDown === 'function' && value.swipeDown(e, params, el);
    }).on('swipeLeft', function (e, params) {
        value.swipeLeft && typeof value.swipeLeft === 'function' && value.swipeLeft(e, params, el);
    }).on('swipeRight', function (e, params) {
        value.swipeRight && typeof value.swipeRight === 'function' && value.swipeRight(e, params, el);
    }).on('rotate', function (e, params) {
        value.rotate && typeof value.rotate === 'function' && value.rotate(e, params, el);
    }).on('pinch', function (e, params) {
        value.pinch && typeof value.pinch === 'function' && value.pinch(e, params, el, initscale);
    }).on('finish', function (e, params) {
        value.finish && typeof value.finish === 'function' && value.finish(e, el);
    })
    theGt._emit("init")
}

export default {
    install(Vue) {

        /* 
            使用指南：

            v-Gesture="option"

                L event为各种事件的回调
                event {tap, dbtap, longtap, slide，swipeUp ，swipeDown，swipeLeft，swipeRight，rotate，pinch, setting}

                L 上面event中混入了setting配置, 可配置swipe的距离，长按的时间，阻止默认事件，阻止冒泡等
                setting { distance, longtapTime}

                L preventDefault, stopPropagation在事件修饰符加 .prevent .stop

                L 回调的参数如下
                callback(e, params= {angle: 0, deltaX: 0, deltaY: 0, diffX: 0, diffY: 0, direction: "" ,zoom: 1})

        */
        Vue.directive('Gesture', {
            // 当被绑定的元素插入到 DOM 中时…… bind(一次绑定) update(动态绑定)
            bind: bindingEvent
        })
    }
}