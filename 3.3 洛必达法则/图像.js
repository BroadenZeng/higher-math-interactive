const introCanvas = document.querySelector("#introGraph"),
  introZoom = document.querySelector("#introZoom"),
  introRanges = [3, 1, 0.3, 0.1, 0.03, 0.01, 0.003, 0.001];
function drawIntro() {
  const a = introRanges[+introZoom.value],
    c = introCanvas,
    ctx = c.getContext("2d"),
    W = c.width,
    H = c.height,
    ox = W / 2,
    oy = H / 2,
    sx = W / (2 * a * 1.14),
    sy = H / (2 * a * 1.14),
    X = (x) => ox + x * sx,
    Y = (y) => oy - y * sy;
  setDynamicMath(
    document.querySelector("#introRange"),
    "\\left[-" + a + ",\\," + a + "\\right]",
    "[−" + a + ", " + a + "]",
  );
  ctx.clearRect(0, 0, W, H);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#dfe5eb";
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(X((a * i) / 4), 0);
    ctx.lineTo(X((a * i) / 4), H);
    ctx.moveTo(0, Y((a * i) / 4));
    ctx.lineTo(W, Y((a * i) / 4));
    ctx.stroke();
  }
  ctx.strokeStyle = "#647587";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, oy);
  ctx.lineTo(W, oy);
  ctx.moveTo(ox, 0);
  ctx.lineTo(ox, H);
  ctx.stroke();
  ctx.fillStyle = "#526273";
  ctx.font = "21px Cambria";
  ctx.fillText("0", ox + 7, oy + 21);
  for (let i = -4; i <= 4; i++) {
    if (!i) continue;
    let v = (a * i) / 4,
      label = Number(v.toPrecision(3)).toString(),
      px = X(v),
      py = Y(v);
    ctx.beginPath();
    ctx.moveTo(px, oy - 5);
    ctx.lineTo(px, oy + 5);
    ctx.moveTo(ox - 5, py);
    ctx.lineTo(ox + 5, py);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(label, px, oy + 24);
    ctx.textAlign = "right";
    ctx.fillText(label, ox - 9, py - 5);
  }
  ctx.textAlign = "left";
  ctx.fillText("x", W - 18, oy - 8);
  ctx.fillText("y", ox + 9, 20);
  function curve(fn, color, dash) {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i <= 600; i++) {
      let x = ((i / 600) * 2 - 1) * a * 1.14,
        y = fn(x);
      i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  curve((x) => Math.expm1(x), "#17365d", []);
  curve((x) => Math.sin(2 * x), "#2f75b5", [10, 7]);
}
if (introCanvas && introZoom && document.querySelector("#introRange")) {
  introZoom.oninput = drawIntro;
  drawIntro();
}
const growthCanvas = document.querySelector("#growthGraph"),
  growthSlider = document.querySelector("#growthX"),
  growthLevels = [2, 4, 8, 20, 50, 100, 200, 500, 1000];
function drawGrowth() {
  let x = growthLevels[+growthSlider.value],
    ctx = growthCanvas.getContext("2d"),
    W = growthCanvas.width,
    H = growthCanvas.height,
    T = 20,
    B = 48,
    xmax = x * 1.1,
    ymax = (2 * x + 1) * 1.2;
  ctx.clearRect(0, 0, W, H);
  ctx.font = "21px Cambria";
  let xlabels = Array.from({ length: 5 }, (_, i) => ((xmax * i) / 4).toFixed(1)),
    ylabels = Array.from({ length: 5 }, (_, i) => ((ymax * i) / 4).toFixed(1)),
    L = Math.max(65, Math.ceil(Math.max(...ylabels.map((t) => ctx.measureText(t).width))) + 14),
    R = Math.max(20, Math.ceil(Math.max(...xlabels.map((t) => ctx.measureText(t).width)) / 2) + 10),
    X = (v) => L + (v / xmax) * (W - L - R),
    Y = (v) => H - B - (v / ymax) * (H - T - B);
  ctx.fillStyle = "#526273";
  ctx.strokeStyle = "#dfe5eb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    let px = L + ((W - L - R) * i) / 4,
      py = H - B - ((H - T - B) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(px, T);
    ctx.lineTo(px, H - B);
    ctx.moveTo(L, py);
    ctx.lineTo(W - R, py);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(((xmax * i) / 4).toFixed(1), px, H - B + 24);
    ctx.textAlign = "right";
    ctx.fillText(((ymax * i) / 4).toFixed(1), L - 8, py + 5);
  }
  ctx.strokeStyle = "#647587";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L, T);
  ctx.lineTo(L, H - B);
  ctx.lineTo(W - R, H - B);
  ctx.stroke();
  function line(fn, col, dash, from) {
    ctx.beginPath();
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.setLineDash(dash);
    let first = true;
    for (let i = 0; i <= 600; i++) {
      let v = (xmax * i) / 600;
      if (v < from) continue;
      let y = fn(v);
      first ? (ctx.moveTo(X(v), Y(y)), (first = false)) : ctx.lineTo(X(v), Y(y));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(L, T, W - L - R, H - T - B);
  ctx.clip();
  line((v) => 2 * v + Math.log1p(Math.exp(-3 * v)), "#17365d", [], 0);
  line((v) => v + 1 / v, "#b34740", [], 0.05);
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = "#888";
  ctx.beginPath();
  ctx.moveTo(X(x), Y(0));
  ctx.lineTo(X(x), Y(2 * x + Math.log1p(Math.exp(-3 * x))));
  ctx.stroke();
  ctx.setLineDash([]);
  for (let [y, col] of [
    [2 * x + Math.log1p(Math.exp(-3 * x)), "#17365d"],
    [x + 1 / x, "#b34740"],
  ]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(X(x), Y(y), 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  setDynamicMath(document.querySelector("#growthRange"), "x=" + x, "x = " + x);
}
if (growthCanvas && growthSlider && document.querySelector("#growthRange")) {
  growthSlider.oninput = drawGrowth;
  drawGrowth();
}
const finiteCanvas = document.querySelector("#finiteGraph"),
  finiteZoom = document.querySelector("#finiteZoom"),
  finiteLevels = [1, 0.5, 0.2, 0.1, 0.03, 0.01, 0.003, 0.001, 0.0001, 0.00001];
function drawFinite() {
  let h = finiteLevels[+finiteZoom.value],
    c = finiteCanvas,
    ctx = c.getContext("2d"),
    W = c.width,
    H = c.height,
    T = 18,
    B = 48,
    xmax = 2 * h,
    ymax = Math.log1p(1 / h ** 4) * 1.45 + 0.2;
  ctx.clearRect(0, 0, W, H);
  ctx.font = "21px Cambria";
  let xlabels = Array.from({ length: 5 }, (_, i) =>
      Number(((xmax * i) / 4).toPrecision(3)).toString(),
    ),
    ylabels = Array.from({ length: 5 }, (_, i) =>
      Number(((ymax * i) / 4).toPrecision(3)).toString(),
    ),
    L = Math.max(70, Math.ceil(Math.max(...ylabels.map((t) => ctx.measureText(t).width))) + 14),
    R = Math.max(20, Math.ceil(Math.max(...xlabels.map((t) => ctx.measureText(t).width)) / 2) + 10),
    X = (v) => L + (v / xmax) * (W - L - R),
    Y = (v) => H - B - (v / ymax) * (H - T - B);
  ctx.fillStyle = "#526273";
  ctx.strokeStyle = "#dfe5eb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    let xx = (xmax * i) / 4,
      yy = (ymax * i) / 4,
      px = X(xx),
      py = Y(yy);
    ctx.beginPath();
    ctx.moveTo(px, T);
    ctx.lineTo(px, H - B);
    ctx.moveTo(L, py);
    ctx.lineTo(W - R, py);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(Number(xx.toPrecision(3)).toString(), px, H - B + 24);
    ctx.textAlign = "right";
    ctx.fillText(Number(yy.toPrecision(3)).toString(), L - 8, py + 5);
  }
  ctx.strokeStyle = "#647587";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X(0), T);
  ctx.lineTo(X(0), H - B);
  ctx.moveTo(L, H - B);
  ctx.lineTo(W - R, H - B);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.rect(L, T, W - L - R, H - T - B);
  ctx.clip();
  function curve(k, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let side of [1]) {
      ctx.beginPath();
      let first = true;
      for (let i = 1; i <= 600; i++) {
        let xx = (side * xmax * i) / 600,
          yy = Math.log1p(1 / Math.abs(xx) ** k);
        if (first) {
          ctx.moveTo(X(xx), Y(yy));
          first = false;
        } else ctx.lineTo(X(xx), Y(yy));
      }
      ctx.stroke();
    }
  }
  curve(4, "#17365d");
  curve(2, "#b34740");
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = "#888";
  for (let side of [1]) {
    let xx = side * h;
    ctx.beginPath();
    ctx.moveTo(X(xx), Y(0));
    ctx.lineTo(X(xx), Y(Math.log1p(1 / h ** 4)));
    ctx.stroke();
  }
  for (let [k, col] of [
    [4, "#17365d"],
    [2, "#b34740"],
  ]) {
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(Math.log1p(1 / h ** k)));
    ctx.lineTo(X(h), Y(Math.log1p(1 / h ** k)));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  for (let side of [1])
    for (let [k, col] of [
      [4, "#17365d"],
      [2, "#b34740"],
    ]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(X(side * h), Y(Math.log1p(1 / h ** k)), 6, 0, Math.PI * 2);
      ctx.fill();
    }
  ctx.restore();
  ctx.font = "bold 21px Cambria";
  ctx.textAlign = "left";
  for (let [k, col] of [
    [4, "#17365d"],
    [2, "#b34740"],
  ]) {
    let y = Math.log1p(1 / h ** k),
      label = "y ≈ " + y.toFixed(2),
      tx = X(h) + 12,
      ty =
        Y(y) +
        (Math.abs(Y(Math.log1p(1 / h ** 4)) - Y(Math.log1p(1 / h ** 2))) < 32
          ? k === 4
            ? -16
            : 24
          : -10);
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fillRect(tx - 3, ty - 18, ctx.measureText(label).width + 6, 24);
    ctx.fillStyle = col;
    ctx.fillText(label, tx, ty);
  }
  setDynamicMath(document.querySelector("#finiteRange"), "x=" + h, "x = " + h);
}
if (finiteCanvas && finiteZoom && document.querySelector("#finiteRange")) {
  finiteZoom.oninput = drawFinite;
  drawFinite();
}
