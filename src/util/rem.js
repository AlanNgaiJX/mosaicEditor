(function (doc, win) {
    const docEl = doc.documentElement;
    const resizeEvt = "orientationchange" in window ? "orientationchange" : "resize";

    function recalc() {
        docEl.style.fontSize = 100 * (docEl.clientWidth / 750) + "px";
    }

    try {
        win.addEventListener(resizeEvt, recalc, false);
        doc.addEventListener("DOMContentLoaded", recalc, false);
    } catch (err) {
        console.warn("setup rem fail !!!");
    }
})(document, window);