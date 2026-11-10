const mono = document.querySelector("#monoGraph"),
  bend = document.querySelector("#bendGraph"),
  slider = document.querySelector("#monoSlider");
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
function drawMono() {
  const a = +slider.value,
    g = graphBase(mono, { x0: -2.25, x1: 2.25, y0: -4.2, y1: 4.2 }),
    fun = (x) => x * x * x - 3 * x,
    dy = 3 * a * a - 3,
    ya = fun(a);
  curve(g, fun, -2.25, 2.25, "#17365d");
  curve(g, (x) => ya + dy * (x - a), -2.25, 2.25, "#b34740", [9, 6]);
  g.ctx.fillStyle = "#17365d";
  g.ctx.beginPath();
  g.ctx.arc(g.X(a), g.Y(ya), 6, 0, Math.PI * 2);
  g.ctx.fill();
  const t = Math.abs(a) < 1e-9 ? 0 : a;
  setDynamicMath(document.querySelector("#monoValue"), "x=" + t, "x = " + t);
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
if (mono && slider) {
  slider.addEventListener("input", drawMono);
  drawMono();
}
if (bend && bendSlider && bendFunction) {
  bend._isDragHandle = bendHitTest;
  bendFunction.addEventListener("change", () => {
    const range = bendRange();
    bendSlider.value = String(Math.max(range.min, Math.min(range.max, +bendSlider.value)));
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

/* 直接拖动曲线上的 A、P、B，比较曲线与弦。 */
const chordCanvas = document.querySelector("#chordGraph"),
  chordSelect = document.querySelector("#chordFunction"),
  chordA = document.querySelector("#chordA"),
  chordM = document.querySelector("#chordM"),
  chordB = document.querySelector("#chordB");
const chordFunctions = {
  square: { f: (x) => x * x, tex: "x^2" },
  negative: { f: (x) => -x * x, tex: "-x^2" },
  cubic: { f: (x) => x * x * x, tex: "x^3" },
  exp: { f: (x) => Math.exp(x), tex: "e^x" },
  sine: { f: (x) => Math.sin(x), tex: "\\sin x" },
};
let chordHandles = [],
  chordGeometry = null,
  chordDrag = null;
const chordLabelOffsets = { curve: null, line: null },
  chordLabelAnchors = { curve: null, line: null };
function chordDomain() {
  return chordSelect.value === "sine" ? { min: -Math.PI, max: Math.PI } : { min: -2, max: 2 };
}
function positionChordLabels(g, x, curveY, lineY) {
  const green = document.querySelector("#curvePointLabel"),
    red = document.querySelector("#linePointLabel");
  if (!green?.style || !red?.style) return;
  const scaleX = chordCanvas.clientWidth / chordCanvas.width,
    scaleY = chordCanvas.clientHeight / chordCanvas.height,
    W = chordCanvas.clientWidth,
    H = chordCanvas.clientHeight,
    px = g.X(x) * scaleX,
    gy = g.Y(curveY) * scaleY,
    ry = g.Y(lineY) * scaleY;
  const gw = green.offsetWidth || 240,
    gh = green.offsetHeight || 32,
    rw = red.offsetWidth || 310,
    rh = red.offsetHeight || 32,
    clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max));
  chordLabelAnchors.curve = { x: px, y: gy };
  chordLabelAnchors.line = { x: px, y: ry };
  const co = chordLabelOffsets.curve,
    lo = chordLabelOffsets.line;
  let gx = clamp(px + (co ? co.x : 12), 3, W - gw - 3),
    rx = clamp(px + (lo ? lo.x : -rw - 12), 3, W - rw - 3),
    gt = clamp(gy + (co ? co.y : -gh / 2), 3, H - gh - 3),
    rt = clamp(ry + (lo ? lo.y : -rh / 2), 3, H - rh - 3);
  if (!co && !lo && gx < rx + rw + 5 && rx < gx + gw + 5 && gt < rt + rh + 5 && rt < gt + gh + 5) {
    gt = clamp(gy + 15, 3, H - gh - 3);
    rt = clamp(ry - rh - 15, 3, H - rh - 3);
  }
  green.style.left = gx + "px";
  green.style.top = gt + "px";
  green.style.visibility = "visible";
  red.style.left = rx + "px";
  red.style.top = rt + "px";
  red.style.visibility = "visible";
}
/* 拖动公式标签，偏移相对对应点保存。 */
for (const [id, key] of [
  ["curvePointLabel", "curve"],
  ["linePointLabel", "line"],
]) {
  const label = document.getElementById(id);
  let drag = null;
  label.dataset.slideDrag = "";
  label.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    const a = chordLabelAnchors[key],
      r = chordCanvas.getBoundingClientRect();
    if (!a || !r.width || !r.height) return;
    event.preventDefault();
    event.stopPropagation();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: parseFloat(label.style.left),
      top: parseFloat(label.style.top),
    };
    label.setPointerCapture(event.pointerId);
    label.style.cursor = "grabbing";
  });
  label.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const r = chordCanvas.getBoundingClientRect(),
      a = chordLabelAnchors[key];
    if (!a || !r.width || !r.height) return;
    const x = drag.left + ((event.clientX - drag.startX) * chordCanvas.clientWidth) / r.width,
      y = drag.top + ((event.clientY - drag.startY) * chordCanvas.clientHeight) / r.height;
    chordLabelOffsets[key] = { x: x - a.x, y: y - a.y };
    drawChord();
  });
  const end = (event) => {
    if (drag && event.pointerId === drag.id) {
      drag = null;
      label.style.cursor = "grab";
    }
  };
  label.addEventListener("pointerup", end);
  label.addEventListener("pointercancel", end);
  label.addEventListener("lostpointercapture", end);
}
function chordInteriorVisible() {
  return (
    !!document.querySelector(".chord-comparison-page.active") ||
    !!document.querySelector(".chord-observation-page.active .chord-interior-reveal.shown")
  );
}
function drawChord() {
  const item = chordFunctions[chordSelect.value],
    f = item.f,
    a = +chordA.value,
    m = +chordM.value,
    b = +chordB.value,
    domain = chordDomain(),
    span = domain.max - domain.min,
    xPadding = span * 0.025,
    x0 = domain.min - xPadding,
    x1 = domain.max + xPadding,
    values = Array.from({ length: 161 }, (_, i) => f(domain.min + (span * i) / 160));
  let lo = Math.min(0, ...values),
    hi = Math.max(0, ...values),
    padding = Math.max((hi - lo) * 0.08, 0.2),
    g = graphBase(chordCanvas, { x0, x1, y0: lo - padding, y1: hi + padding });
  curve(g, f, domain.min, domain.max, "#17365d");
  const fa = f(a),
    fm = f(m),
    fb = f(b),
    chord = (x) => fa + ((fb - fa) * (x - a)) / (b - a);
  curve(g, chord, a, b, "#2f75b5", [8, 6]);
  // 坐标轴正方向的箭头，与网格和曲线使用同一坐标映射。
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
  const { ctx, X, Y } = g;
  chordGeometry = { left: g.p.l, width: g.w, x0, x1 };
  const showInterior = chordInteriorVisible(),
    points = [
      [a, fa, "A", "x₁", chordA],
      ...(showInterior ? [[m, fm, "P", "x", chordM]] : []),
      [b, fb, "B", "x₂", chordB],
    ];
  const mathLayer = chordCanvas.parentElement.querySelector(".graph-math-layer");
  for (const key of ["point-P", "tick-x"]) {
    const label = mathLayer?.querySelector('[data-graph-math="' + key + '"]');
    if (label) label.style.display = showInterior ? "" : "none";
  }
  chordHandles = points.map(([x, y, label, axisLabel, control]) => {
    const ys = [Y(y), Y(0)];
    if (label === "P") ys.push(Y(chord(m)));
    let top = Math.min(...ys),
      bottom = Math.max(...ys);
    if (bottom - top < 24) {
      const center = (top + bottom) / 2;
      top = center - 12;
      bottom = center + 12;
    }
    return { x: X(x), y1: top, y2: bottom, axisY: Y(0), label: axisLabel, control };
  });
  ctx.save();
  ctx.beginPath();
  ctx.rect(g.p.l, g.p.t, g.w, g.h);
  ctx.clip();
  ctx.strokeStyle = "#8b99a8";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  for (const handle of chordHandles) {
    ctx.beginPath();
    ctx.moveTo(handle.x, handle.y1);
    ctx.lineTo(handle.x, handle.y2);
    ctx.stroke();
  }
  if (showInterior) {
    ctx.strokeStyle = "#6e8297";
    ctx.beginPath();
    ctx.moveTo(X(m), Y(fm));
    ctx.lineTo(X(m), Y(chord(m)));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // 同一横坐标下，弦上的对应点与曲线上的 P 点在下一步出现。
  if (showInterior) {
    ctx.fillStyle = "#b34740";
    ctx.beginPath();
    ctx.arc(X(m), Y(chord(m)), 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  for (const [x, y, label] of points) {
    const px = X(x),
      py = Y(y);
    ctx.fillStyle = label === "P" ? "#008000" : "#17365d";
    ctx.beginPath();
    ctx.arc(px, py, label === "P" ? 6 : 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "18px Cambria, serif";
    ctx.fillStyle = "#526c86";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const nearAxis = label === "P" && Math.abs(py - Y(0)) < 30,
      dx = label === "A" ? -20 : nearAxis ? -24 : 12,
      dy = nearAxis ? -18 : label === "P" && Y(chord(m)) < py ? 17 : -15,
      lx = Math.max(g.p.l + 3, Math.min(px + dx, g.p.l + g.w - 18)),
      ly = Math.max(g.p.t + 11, Math.min(py + dy, g.p.t + g.h - 11));
    graphMath(g, "point-" + label, label, lx, ly, "left-middle");
  }
  for (const handle of chordHandles) {
    ctx.fillStyle = "#17365d";
    ctx.font = "20px Cambria, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    graphMath(
      g,
      "tick-" + handle.label,
      handle.label === "x₁" ? "x_1" : handle.label === "x₂" ? "x_2" : "x",
      handle.x,
      handle.axisY + 10,
    );
  }
  ctx.restore();
  setDynamicMath(document.querySelector("#chordFormula"), "y=" + item.tex, "y = " + item.tex);
  for (const [id, symbol, x] of [
    ["chordAValue", "x_1", a],
    ["chordMValue", "x", m],
    ["chordBValue", "x_2", b],
  ])
    setDynamicMath(
      document.querySelector("#" + id),
      symbol + "=" + x,
      symbol.replace("_", "") + " = " + x,
    );
  positionChordLabels(g, m, fm, chord(m));
}
function chordEventPoint(event) {
  const r = chordCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) * chordCanvas.width) / r.width,
    y: ((event.clientY - r.top) * chordCanvas.height) / r.height,
  };
}
function chordHitTest(event) {
  const point = chordEventPoint(event);
  let nearest = null,
    best = 24;
  for (const handle of chordHandles) {
    const dy = Math.max(handle.y1 - point.y, 0, point.y - handle.y2);
    const distance = Math.hypot(point.x - handle.x, dy);
    if (distance < best) {
      best = distance;
      nearest = handle;
    }
  }
  return nearest;
}
chordCanvas._isDragHandle = (event) => !!chordHitTest(event);
function moveChordPoint(control, x) {
  const a = +chordA.value,
    m = +chordM.value,
    b = +chordB.value,
    round = (v) => Math.round(v * 100) / 100;
  let value;
  const domain = chordDomain(),
    showInterior = chordInteriorVisible();
  if (control === chordA)
    value = Math.max(domain.min, Math.min(x, (showInterior ? m : b - 0.01) - 0.01));
  else if (control === chordM) value = Math.max(a + 0.01, Math.min(x, b - 0.01));
  else value = Math.min(domain.max, Math.max(x, (showInterior ? m : a + 0.01) + 0.01));
  control.value = String(round(value));
  if (!showInterior && control !== chordM) {
    const left = +chordA.value,
      right = +chordB.value;
    chordM.value = String(round(Math.max(left + 0.01, Math.min(+chordM.value, right - 0.01))));
  }
  drawChord();
}
chordCanvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.pointerType !== "touch") return;
  const handle = chordHitTest(event);
  if (!handle) return;
  event.preventDefault();
  chordDrag = { id: event.pointerId, control: handle.control };
  chordCanvas.setPointerCapture(event.pointerId);
  chordCanvas.style.cursor = "grabbing";
});
chordCanvas.addEventListener("pointermove", (event) => {
  if (!chordDrag) {
    chordCanvas.style.cursor = chordHitTest(event) ? "grab" : "default";
    return;
  }
  if (event.pointerId !== chordDrag.id) return;
  const point = chordEventPoint(event),
    x =
      chordGeometry.x0 +
      ((point.x - chordGeometry.left) / chordGeometry.width) *
        (chordGeometry.x1 - chordGeometry.x0);
  moveChordPoint(chordDrag.control, x);
});
function endChordDrag(event) {
  if (chordDrag && event.pointerId === chordDrag.id) {
    chordDrag = null;
    chordCanvas.style.cursor = "default";
  }
}
chordCanvas.addEventListener("pointerup", endChordDrag);
chordCanvas.addEventListener("pointercancel", endChordDrag);
chordCanvas.addEventListener("lostpointercapture", endChordDrag);
chordCanvas.addEventListener("pointerleave", () => {
  if (!chordDrag) chordCanvas.style.cursor = "default";
});
chordSelect.addEventListener("change", () => {
  const domain = chordDomain(),
    round = (x) => Math.round(x * 100) / 100,
    a = Math.max(domain.min, Math.min(+chordA.value, domain.max - 0.02)),
    b = Math.min(domain.max, Math.max(+chordB.value, a + 0.02)),
    m = Math.max(a + 0.01, Math.min(+chordM.value, b - 0.01));
  chordA.value = String(round(a));
  chordM.value = String(round(m));
  chordB.value = String(round(b));
  drawChord();
});
drawChord();

if (window.MathJax?.startup?.promise)
  window.MathJax.startup.promise.then(() => drawChord()).catch(() => {});

/* 两页共用同一张可拖动图像，切页后保留函数和点的位置。 */
const chordInitialSlot = document.querySelector("#chordInitialSlot"),
  chordComparisonSlot = document.querySelector("#chordComparisonSlot"),
  chordLayout = chordCanvas.closest(".chord-layout"),
  chordObservationPage = chordInitialSlot.closest(".slide"),
  chordComparisonPage = chordComparisonSlot.closest(".slide");
function syncChordPage() {
  const compare = chordComparisonPage.classList.contains("active"),
    observe = chordObservationPage.classList.contains("active");
  if (!compare && !observe) return;
  const slot = compare ? chordComparisonSlot : chordInitialSlot;
  if (chordLayout.parentElement === slot) return;
  slot.appendChild(chordLayout);
  chordLayout.classList.toggle("show-coordinates", compare);
  drawChord();
}
const chordRevealMarker = chordObservationPage.querySelector(".chord-interior-reveal");
const chordRevealObserver = new MutationObserver(() => {
  if (chordObservationPage.classList.contains("active")) drawChord();
});
if (chordRevealMarker)
  chordRevealObserver.observe(chordRevealMarker, { attributes: true, attributeFilter: ["class"] });
const chordPageObserver = new MutationObserver(syncChordPage);
chordPageObserver.observe(chordObservationPage, { attributes: true, attributeFilter: ["class"] });
chordPageObserver.observe(chordComparisonPage, { attributes: true, attributeFilter: ["class"] });
syncChordPage();

/* 使用可键盘操作的公式选项，同时保留原有函数选择逻辑。 */
function createMathFunctionMenu(select, formulas) {
  if (!select) return;
  const wrapper = document.createElement("div"),
    button = document.createElement("button"),
    menu = document.createElement("div");
  wrapper.className = "math-function-menu";
  button.type = "button";
  button.className = "math-function-current";
  button.setAttribute("aria-label", select.getAttribute("aria-label") || "选择函数");
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  menu.className = "math-function-options";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  select.parentElement.insertBefore(wrapper, select);
  wrapper.append(button, menu, select);
  select.hidden = true;
  const label = document.createElement("span");
  button.appendChild(label);
  const refresh = () => {
    const option = select.selectedOptions[0];
    setDynamicMath(label, formulas[select.value], option?.textContent || "");
    for (const o of menu.children)
      o.setAttribute("aria-selected", String(o.dataset.value === select.value));
  };
  for (const option of select.options) {
    const choice = document.createElement("button");
    choice.type = "button";
    choice.dataset.value = option.value;
    choice.setAttribute("role", "option");
    setDynamicMath(choice, formulas[option.value], option.textContent);
    choice.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.focus();
    });
    menu.appendChild(choice);
  }
  button.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    button.setAttribute("aria-expanded", String(!menu.hidden));
  });
  wrapper.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(event.key))
      event.stopPropagation();
    if (event.key === "Escape") {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (menu.hidden) {
        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
      }
      const options = [...menu.children],
        i = options.indexOf(document.activeElement),
        next =
          i < 0
            ? event.key === "ArrowDown"
              ? 0
              : options.length - 1
            : Math.max(0, Math.min(options.length - 1, i + (event.key === "ArrowDown" ? 1 : -1)));
      options[next].focus();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!wrapper.contains(event.target)) {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }
  });
  select.addEventListener("change", refresh);
  refresh();
}
createMathFunctionMenu(chordSelect, {
  square: "y=x^2",
  negative: "y=-x^2",
  cubic: "y=x^3",
  exp: "y=e^x",
  sine: "y=\\sin x",
});
createMathFunctionMenu(bendFunction, { square: "f(x)=x^2", arch: "g(x)=4x-x^2" });
