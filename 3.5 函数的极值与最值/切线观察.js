"use strict";
// Adapted from the existing 3.4 tangent demonstration; public resources are unchanged.
const bend = document.getElementById("bendGraph");
function graphBase(canvas, range) {
  const ctx = canvas.getContext("2d"),
    W = canvas.width,
    H = canvas.height,
    p = { l: 68, r: 24, t: 22, b: 48 },
    w = W - p.l - p.r,
    h = H - p.t - p.b,
    X = (x) => p.l + ((x - range.x0) / (range.x1 - range.x0)) * w,
    Y = (y) => p.t + ((range.y1 - y) / (range.y1 - range.y0)) * h;
  ctx.clearRect(0, 0, W, H);
  ctx.font = "20px Cambria, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let x = Math.ceil(range.x0); x <= range.x1; x++) {
    let q = X(x);
    ctx.beginPath();
    ctx.strokeStyle = "#e3eaf0";
    ctx.lineWidth = 1;
    ctx.moveTo(q, p.t);
    ctx.lineTo(q, p.t + h);
    ctx.stroke();
    ctx.fillStyle = "#5c7086";
    ctx.fillText(String(x), q, p.t + h + 8);
  }
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (
    let y = Math.ceil(range.y0 / (range.yStep || 1)) * (range.yStep || 1);
    y <= range.y1;
    y += range.yStep || 1
  ) {
    let q = Y(y);
    ctx.beginPath();
    ctx.strokeStyle = "#e3eaf0";
    ctx.moveTo(p.l, q);
    ctx.lineTo(p.l + w, q);
    ctx.stroke();
    ctx.fillStyle = "#5c7086";
    ctx.fillText(String(y), p.l - 9, q);
  }
  ctx.strokeStyle = "#75899d";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p.l, Y(0));
  ctx.lineTo(p.l + w, Y(0));
  ctx.moveTo(X(0), p.t);
  ctx.lineTo(X(0), p.t + h);
  ctx.stroke();
  return { canvas, ctx, X, Y, p, w, h };
}
/* 数学字母作为 MathJax 公式覆盖在画布上，随图像坐标同步移动。 */
function graphMath(g, key, tex, x, y, align = "center") {
  const canvas = g.canvas,
    host = canvas.parentElement;
  let layer = host.querySelector(":scope > .graph-math-layer");
  if (!layer) {
    host.style.position = "relative";
    layer = document.createElement("div");
    layer.className = "graph-math-layer";
    host.appendChild(layer);
  }
  let e = layer.querySelector('[data-graph-math="' + key + '"]');
  if (!e) {
    e = document.createElement("span");
    e.className = "graph-math-label";
    e.dataset.graphMath = key;
    layer.appendChild(e);
  }
  if (e.dataset.graphTex !== tex) {
    e.dataset.graphTex = tex;
    setDynamicMath(e, tex, tex);
  }
  e.style.left = (x * canvas.clientWidth) / canvas.width + "px";
  e.style.top = (y * canvas.clientHeight) / canvas.height + "px";
  e.style.transform =
    align === "right-bottom"
      ? "translate(-100%,-100%)"
      : align === "left-top"
        ? "translate(0,0)"
        : align === "left-middle"
          ? "translate(0,-50%)"
          : "translate(-50%,0)";
}
function curve(g, fun, a, b, color, dash = []) {
  const { ctx, X, Y, p, w, h } = g;
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.l, p.t, w, h);
  ctx.clip();
  ctx.beginPath();
  for (let i = 0; i <= 500; i++) {
    let x = a + ((b - a) * i) / 500,
      y = fun(x);
    if (i === 0) ctx.moveTo(X(x), Y(y));
    else ctx.lineTo(X(x), Y(y));
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}
const bendSlider = document.querySelector("#bendSlider"),
  bendFunction = document.querySelector("#bendFunction");
let bendGeometry = null,
  bendDrag = null;
function bendRange() {
  return bendFunction.value === "arch"
    ? { min: 0, max: 4, x0: -0.3, x1: 4.3, y0: -0.6, y1: 4.8, yStep: 1 }
    : { min: -2, max: 2, x0: -2.3, x1: 2.3, y0: -0.6, y1: 4.8, yStep: 1 };
}
function drawBend() {
  const range = bendRange(),
    a = +bendSlider.value,
    arch = bendFunction.value === "arch",
    g = graphBase(bend, range),
    f = (x) => x * x,
    h = (x) => 4 * x - x * x;
  {
    const { ctx, X, Y, p, w } = g,
      axisX = X(0),
      axisY = Y(0),
      right = p.l + w,
      top = p.t;
    ctx.save();
    ctx.strokeStyle = "#75899d";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(right - 9, axisY - 5);
    ctx.lineTo(right, axisY);
    ctx.lineTo(right - 9, axisY + 5);
    ctx.moveTo(axisX - 5, top + 9);
    ctx.lineTo(axisX, top);
    ctx.lineTo(axisX + 5, top + 9);
    ctx.stroke();
    ctx.fillStyle = "#5c7086";
    ctx.font = "italic 19px Cambria, serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    graphMath(g, "axis-x", "x", right - 4, axisY - 7, "right-bottom");
    graphMath(g, "axis-y", "y", axisX + 8, top + 3, "left-top");
    ctx.restore();
  }
  const fn = arch ? h : f,
    slope = arch ? 4 - 2 * a : 2 * a,
    y = fn(a);
  curve(g, fn, range.min, range.max, "#17365d");
  curve(g, (x) => y + slope * (x - a), range.x0, range.x1, "#b34740", [8, 6]);
  g.ctx.beginPath();
  g.ctx.fillStyle = "#17365d";
  g.ctx.arc(g.X(a), g.Y(y), 6, 0, 2 * Math.PI);
  g.ctx.fill();
  setDynamicMath(document.getElementById("slope35"), "f^{\\prime}(" + (Math.abs(a) < 0.005 ? "0.00" : a.toFixed(2)) + ")=" + (Math.abs(slope) < 0.005 ? "0.00" : slope.toFixed(2)), "斜率 = " + slope.toFixed(2));
  bendGeometry = {
    a,
    pointX: g.X(a),
    pointY: g.Y(y),
    lineSlope: (g.Y(y + slope) - g.Y(y)) / (g.X(a + 1) - g.X(a)),
    left: g.p.l,
    top: g.p.t,
    width: g.w,
    height: g.h,
    x0: range.x0,
    x1: range.x1,
  };
}
function bendEventPoint(event) {
  const r = bend.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) * bend.width) / r.width,
    y: ((event.clientY - r.top) * bend.height) / r.height,
  };
}
function bendHitTest(event) {
  if (!bendGeometry) return false;
  const p = bendEventPoint(event),
    g = bendGeometry;
  if (
    p.x < g.left - 10 ||
    p.x > g.left + g.width + 10 ||
    p.y < g.top - 10 ||
    p.y > g.top + g.height + 10
  )
    return false;
  const pointDistance = Math.hypot(p.x - g.pointX, p.y - g.pointY),
    lineDistance =
      Math.abs(p.y - g.pointY - g.lineSlope * (p.x - g.pointX)) / Math.hypot(1, g.lineSlope);
  return pointDistance < 24 || lineDistance < 15;
}
function bendGraphX(canvasX) {
  const g = bendGeometry;
  return g.x0 + ((canvasX - g.left) / g.width) * (g.x1 - g.x0);
}
if (bend && bendSlider && bendFunction) {
  bend._isDragHandle = bendHitTest;
  bendFunction.addEventListener("change", () => {
    const range = bendRange();
    bendSlider.value = bendFunction.value === "arch" ? "0.5" : "-1";
    drawBend();
  });
  drawBend();
  bend.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    if (!bendHitTest(event)) return;
    event.preventDefault();
    const x = bendGraphX(bendEventPoint(event).x);
    bendDrag = { id: event.pointerId, offset: x - +bendSlider.value };
    bend.setPointerCapture(event.pointerId);
    bend.style.cursor = "grabbing";
  });
  bend.addEventListener("pointermove", (event) => {
    if (!bendDrag) {
      bend.style.cursor = bendHitTest(event) ? "grab" : "default";
      return;
    }
    if (event.pointerId !== bendDrag.id) return;
    const x = bendGraphX(bendEventPoint(event).x) - bendDrag.offset;
    const range = bendRange();
    bendSlider.value = String(Math.round(Math.max(range.min, Math.min(range.max, x)) * 100) / 100);
    drawBend();
  });
  const endBendDrag = (event) => {
    if (bendDrag && event.pointerId === bendDrag.id) {
      bendDrag = null;
      bend.style.cursor = "default";
    }
  };
  bend.addEventListener("pointerup", endBendDrag);
  bend.addEventListener("pointercancel", endBendDrag);
  bend.addEventListener("lostpointercapture", endBendDrag);
  bend.addEventListener("pointerleave", () => {
    if (!bendDrag) bend.style.cursor = "default";
  });
}



