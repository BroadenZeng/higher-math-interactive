const slides = [...document.querySelectorAll(".slide")],
  stage = document.querySelector("#stage");
let page = 0,
  reveal = 0,
  lessonMode = "presentation",
  presentationPage = 0,
  presentationReveal = 0,
  boardPages = [],
  boardPosition = 0,
  slideBoard = new Map(),
  boardSlide = new Map();
function maxStep() {
  return Math.max(
    0,
    ...[...slides[page].querySelectorAll("[data-step]")].map(
      (x) => +x.dataset.step,
    ),
  );
}
function show() {
  let previous = document.querySelector(".slide.active"),
    oldBar = previous?.querySelector(".writing-tools"),
    keep = previous && previous !== slides[page] && oldBar && !oldBar.hidden,
    position = keep
      ? {
          left: oldBar.style.left,
          top: oldBar.style.top,
          bottom: oldBar.style.bottom,
        }
      : null;
  slides.forEach((s, i) => s.classList.toggle("active", i === page));
  slides[page]
    .querySelectorAll("[data-step]")
    .forEach((e) => e.classList.toggle("shown", +e.dataset.step <= reveal));
  const pageHash = `#p${page + 1}-${reveal}`;
  if (location.hash !== pageHash) {
    try {
      history.replaceState(history.state, "", pageHash);
    } catch {
      // Preserve page recovery if the browser disallows History API updates.
      location.hash = pageHash;
    }
  }
  if (typeof applyLessonMode === "function") applyLessonMode();
  if (keep) {
    oldBar.hidden = true;
    previous
      .querySelector(".tool-toggle")
      ?.setAttribute("aria-expanded", "false");
    let bar = slides[page].querySelector(".writing-tools"),
      toggle = slides[page].querySelector(".tool-toggle");
    if (bar) {
      bar.hidden = false;
      bar.style.left = position.left;
      bar.style.top = position.top;
      bar.style.bottom = position.bottom;
      let options = bar.querySelector(".pen-options");
      if (options) options.hidden = false;
      let menu = bar.querySelector(".archive-menu");
      if (menu) menu.hidden = true;
      let archiveButton = bar.querySelector(".archive-toggle");
      if (archiveButton) archiveButton.setAttribute("aria-expanded", "false");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      syncPen();
    }
  }
  if (typeof updatePageTools === "function") updatePageTools();
}
function next() {
  if (lessonMode === "whiteboard") {
    if (boardPosition < boardPages.length - 1) {
      boardPosition++;
      page = slides.indexOf(boardPages[boardPosition]);
      reveal = 0;
    }
  } else if (reveal < maxStep()) reveal++;
  else {
    let n = page + 1;
    while (n < slides.length && slides[n].classList.contains("blank-board"))
      n++;
    if (n < slides.length) {
      page = n;
      reveal = 0;
    }
  }
  show();
}
function prev() {
  if (lessonMode === "whiteboard") {
    if (boardPosition > 0) {
      boardPosition--;
      page = slides.indexOf(boardPages[boardPosition]);
      reveal = 0;
    }
  } else if (reveal > 0) reveal--;
  else {
    let n = page - 1;
    while (n >= 0 && slides[n].classList.contains("blank-board")) n--;
    if (n >= 0) {
      page = n;
      reveal = maxStep();
    }
  }
  show();
}
function fit() {
  let s = Math.min(innerWidth / 1600, innerHeight / 900);
  stage.style.transform = `translate(${(innerWidth - 1600 * s) / 2}px,${(innerHeight - 900 * s) / 2}px) scale(${s})`;
}
onresize = fit;
onkeydown = (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
  const target = e.target,
    tag = target?.tagName?.toUpperCase(),
    editable =
      target?.isContentEditable ||
      target?.closest?.('[contenteditable]:not([contenteditable="false"])'),
    input =
      tag === "INPUT" &&
      !["button", "submit", "reset"].includes(
        (target.type || "").toLowerCase(),
      ),
    control = editable || input || tag === "TEXTAREA" || tag === "SELECT";
  if (control) return;
  if (e.key.toLowerCase() === "b") {
    if (e.repeat) return;
    const toggle = slides[page]?.querySelector(".tool-toggle");
    if (toggle) {
      e.preventDefault();
      toggle.click();
    }
    return;
  }
  if (tag === "BUTTON" && e.key === " ") return;
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
    e.preventDefault();
    next();
  } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
    e.preventDefault();
    prev();
  }
};
let match = location.hash.match(/p(\d+)-(\d+)/);
if (match) {
  page = Math.min(slides.length - 1, Math.max(0, +match[1] - 1));
  reveal = Math.min(maxStep(), +match[2]);
}
fit();
show();
function setDynamicMath(element, tex, fallback) {
  if (!element) return;
  element.dataset.mathValue = tex;
  element.textContent = fallback;
  const math = window.MathJax;
  const render = () => {
    if (
      element.dataset.mathValue !== tex ||
      typeof math?.tex2svg !== "function"
    )
      return;
    try {
      element.replaceChildren(math.tex2svg(tex, { display: false }));
    } catch (e) {
      element.textContent = fallback;
    }
  };
  if (math?.startup?.promise) math.startup.promise.then(render).catch(() => {});
  else if (typeof math?.tex2svg === "function") render();
}

// 放映画笔工具栏、颜色和画布在公共脚本中统一定义。
const annotationPalette = [
  [
    "黑色",
    "#111111"
  ],
  [
    "红色",
    "#e00000"
  ],
  [
    "蓝色",
    "#0055d4"
  ],
  [
    "绿色",
    "#008000"
  ],
  [
    "黄色",
    "#ffdf00"
  ],
  [
    "橙色",
    "#ff8c00"
  ],
  [
    "紫色",
    "#8000a8"
  ],
  [
    "玫红色",
    "#c0007a"
  ],
  [
    "深灰色",
    "#555555"
  ],
  [
    "深红色",
    "#8b0000"
  ],
  [
    "深蓝色",
    "#003080"
  ],
  [
    "深绿色",
    "#005b32"
  ],
  [
    "棕色",
    "#8b4513"
  ],
  [
    "青色",
    "#008b8b"
  ],
  [
    "天蓝色",
    "#00a6d6"
  ]
];
const annotationSwatches = annotationPalette.map(([label, color], index) =>
  `<button type="button" aria-label="${label}" class="swatch${index === 0 ? " selected" : ""}" data-color="${color}" style="background:${color}"></button>`
).join("");
const sharedAnnotationTemplate = document.createElement("template");
sharedAnnotationTemplate.innerHTML = `<button aria-expanded="false" aria-label="隐藏书写工具" class="tool-toggle">▲</button>
      <div class="writing-tools" hidden="">
        <button aria-label="画笔" class="pen" hidden=""></button>
        <div class="pen-options">
          <div class="palette">${annotationSwatches}</div>
          <div class="width-control">
            <input aria-label="画笔粗细" class="width-slider" max="16" min="1" type="range" value="3" />
          </div>
          <input class="ink-color" type="hidden" value="#111111" />
        </div>
        <div class="tool-row">
          <button aria-label="鼠标" class="pointer-mode" title="鼠标">
            <svg aria-hidden="true" viewbox="0 0 24 24"><path d="M5 3v15l4-4 3 6 3-1.5-3-6h5z"></path></svg></button
          ><button aria-label="新增白板页" class="add-board" title="新增白板页">
            <svg aria-hidden="true" viewbox="0 0 24 24">
              <path d="M5 3h10l4 4v14H5z M15 3v4h4 M12 10v7 M8.5 13.5h7"></path>
            </svg></button
          ><button aria-label="切换放映与白板模式" class="mode-switch" title="切换放映与白板模式">
            <svg aria-hidden="true" viewbox="0 0 24 24">
              <path d="M4 5h16v12H4z M8 21l4-4 4 4 M9 10l2 2 4-4"></path>
            </svg></button
          ><button aria-label="撤销" class="undo" title="撤销">↶</button
          ><button aria-label="重做" class="redo" title="重做">↷</button>
        </div>
        <div class="page-navigation">
          <button aria-label="橡皮" class="eraser" title="橡皮">
            <svg aria-hidden="true" viewbox="0 0 24 24">
              <path
                d="M3 15.5 12.6 5.9a2.8 2.8 0 0 1 4 0l3.5 3.5a2.8 2.8 0 0 1 0 4L14 19.5H8z M8 10.5l6 6 M14 19.5h7"
              ></path>
            </svg></button
          ><button aria-label="清空本页" class="clear" title="清空本页">
            <svg aria-hidden="true" viewbox="0 0 24 24">
              <path d="M4 7h16 M9 7V4h6v3 M7 7l1 13h8l1-13 M10 10v7 M14 10v7"></path>
            </svg></button
          ><button class="archive-toggle" aria-label="保存和读取" title="保存和读取" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 2h9v11H3z M3 6v13" /></svg></button
          ><button aria-label="上一页" class="page-prev" title="上一页">◀</button
          ><button aria-label="下一页" class="page-next" title="下一页">▶</button>
          <div class="archive-menu" hidden>
            <button class="archive-save" type="button">保存</button
            ><button class="archive-load" type="button">读取</button>
          </div>
        </div>
      </div>
      <canvas aria-label="课堂手写层" class="writing-canvas" height="900" width="1600"></canvas
    >`;
const templateSlide = sharedAnnotationTemplate.content;
function prepareSlide(slide) {
  slide.classList.add("writing-slide", "annotation-page");
  // 兼容旧课件内嵌工具栏；统一替换为公共组件，保留页面原有画布。
  [".tool-toggle", ".writing-tools"].forEach((sel) => {
    slide.querySelector(sel)?.remove();
    slide.appendChild(templateSlide.querySelector(sel).cloneNode(true));
  });
  if (!slide.querySelector(".writing-canvas"))
    slide.appendChild(templateSlide.querySelector(".writing-canvas").cloneNode(true));
  let hold = null,
    startX = 0,
    startY = 0,
    holdFired = false;
  slide.addEventListener(
    "pointerdown",
    (e) => {
      if (
        e.target.closest(
          "button,input,select,option,textarea,.writing-tools,[data-slide-drag]",
        ) ||
        e.target._isDragHandle?.(e)
      )
        return;
      holdFired = false;
      if (
        typeof mousePageClickTimer !== "undefined" &&
        mousePageClickTimer !== null
      ) {
        clearTimeout(mousePageClickTimer);
        mousePageClickTimer = null;
      }
      startX = e.clientX;
      startY = e.clientY;
      hold = setTimeout(() => {
        holdFired = true;
        let toggle = slide.querySelector(".tool-toggle"),
          bar = slide.querySelector(".writing-tools");
        if (toggle.getAttribute("aria-expanded") !== "true") toggle.click();
        let r = slide.getBoundingClientRect(),
          scale = r.width / 1600,
          x = (startX - r.left) / scale,
          y = (startY - r.top) / scale;
        let bx = Math.max(10, Math.min(x, 1600 - bar.offsetWidth - 10)),
          by = Math.max(10, Math.min(y, 900 - bar.offsetHeight - 48));
        bar.style.left = bx + "px";
        bar.style.top = by + "px";
        bar.style.bottom = "auto";
        toggle.style.left = bx + "px";
        toggle.style.top = by + bar.offsetHeight + 8 + "px";
        toggle.style.bottom = "auto";
      }, 650);
    },
    true,
  );
  slide.addEventListener(
    "pointermove",
    (e) => {
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) {
        clearTimeout(hold);
        hold = null;
      }
    },
    true,
  );
  ["pointerup", "pointercancel"].forEach((type) =>
    slide.addEventListener(
      type,
      () => {
        clearTimeout(hold);
        hold = null;
        if (type === "pointercancel") holdFired = false;
      },
      true,
    ),
  );
  slide.addEventListener(
    "click",
    (e) => {
      if (holdFired && (e.isTrusted || e.detail > 0)) {
        holdFired = false;
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  slide.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
document.querySelectorAll(".slide").forEach(prepareSlide);
const sharedPen = { width: 3, color: "#111111" };
function syncPen() {
  document.querySelectorAll(".writing-slide").forEach((slide) => {
    slide.querySelector(".ink-color").value = sharedPen.color;
    slide.querySelector(".width-slider").value = sharedPen.width;
    let slider = slide.querySelector(".width-slider");
    slider.style.setProperty("--track-size", sharedPen.width + "px");
    slider.style.setProperty("--track-color", sharedPen.color);
    slide
      .querySelectorAll(".swatch")
      .forEach((b) =>
        b.classList.toggle("selected", b.dataset.color === sharedPen.color),
      );
  });
}
function initWriting(slide) {
  let erase = false,
    c = slide.querySelector(".writing-canvas"),
    ctx = c.getContext("2d"),
    bar = slide.querySelector(".writing-tools"),
    toggle = slide.querySelector(".tool-toggle"),
    pen = slide.querySelector(".pen"),
    eraser = slide.querySelector(".eraser"),
    pointer = slide.querySelector(".pointer-mode"),
    addBoard = slide.querySelector(".add-board"),
    modeButton = slide.querySelector(".mode-switch"),
    color = slide.querySelector(".ink-color"),
    options = slide.querySelector(".pen-options"),
    undo = slide.querySelector(".undo"),
    redo = slide.querySelector(".redo"),
    drawing = false,
    history = [],
    future = [];
  function state() {
    return ctx.getImageData(0, 0, c.width, c.height);
  }
  function restore(v) {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.putImageData(v, 0, 0);
  }
  function save() {
    history.push(state());
    if (history.length > 25) history.shift();
    future = [];
  }
  function controls() {
    undo.disabled = !history.length;
    redo.disabled = !future.length;
  }
  slide._resetWhiteboardHistory = () => {
    history = [];
    future = [];
    controls();
  };
  const archiveButton = slide.querySelector(".archive-toggle"),
    archiveMenu = slide.querySelector(".archive-menu");
  function closeArchiveMenu() {
    archiveMenu.hidden = true;
    archiveButton.setAttribute("aria-expanded", "false");
  }
  archiveButton.onclick = () => {
    if (!archiveMenu.hidden) {
      closeArchiveMenu();
      return;
    }
    archiveMenu.hidden = false;
    archiveButton.setAttribute("aria-expanded", "true");
    archiveMenu.style.left = "calc(100% + 8px)";
    archiveMenu.style.right = "auto";
    if (
      archiveMenu.getBoundingClientRect().right >
      slide.getBoundingClientRect().right - 4
    ) {
      archiveMenu.style.left = "auto";
      archiveMenu.style.right = "calc(100% + 8px)";
    }
  };
  slide.querySelector(".archive-save").onclick = () => {
    closeArchiveMenu();
    saveWhiteboardArchive();
  };
  slide.querySelector(".archive-load").onclick = () => {
    closeArchiveMenu();
    openWhiteboardArchive();
  };
  function setOpen(open) {
    bar.hidden = !open;
    if (!open) {
      options.hidden = true;
      closeArchiveMenu();
    } else {
      syncPen();
    }
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.onclick = () => {
    if (bar.hidden) {
      setOpen(true);
      options.hidden = false;
      applyLessonMode();
    } else setOpen(false);
  };
  slide.addEventListener(
    "pointerdown",
    (e) => {
      if (!bar.hidden && !bar.contains(e.target) && !toggle.contains(e.target))
        setOpen(false);
    },
    true,
  );
  pointer.onclick = () => {
    slide.classList.remove("annotation-active");
    pointer.classList.add("chosen");
    eraser.classList.remove("chosen");
    ring.style.display = "none";
  };
  addBoard.onclick = () => {
    if (lessonMode === "presentation") {
      presentationPage = page;
      presentationReveal = reveal;
      lessonMode = "whiteboard";
    } else {
      let owner = boardSlide.get(slides[page]);
      if (owner) {
        presentationPage = slides.indexOf(owner.slide);
        presentationReveal = owner.reveal;
      }
    }
    createBoard();
    boardPosition = boardPages.length - 1;
    page = slides.indexOf(boardPages[boardPosition]);
    reveal = 0;
    show();
  };
  modeButton.onclick = () => {
    setOpen(false);
    erase = false;
    eraser.classList.remove("chosen");
    ring.style.display = "none";
    if (lessonMode === "presentation") {
      presentationPage = page;
      presentationReveal = reveal;
      let original = slides[page],
        linked = slideBoard.get(original);
      lessonMode = "whiteboard";
      if (!linked) {
        createBoard();
        linked = boardPages[boardPages.length - 1];
        slideBoard.set(original, linked);
      }
      boardPosition = boardPages.indexOf(linked);
      page = slides.indexOf(linked);
      reveal = 0;
    } else {
      let current = slides[page],
        link = boardSlide.get(current);
      boardPosition = Math.max(0, boardPages.indexOf(current));
      if (link) {
        presentationPage = slides.indexOf(link.slide);
        presentationReveal = link.reveal;
        slideBoard.set(link.slide, current);
      }
      lessonMode = "presentation";
      page = presentationPage;
      reveal = presentationReveal;
    }
    show();
  };
  slide.querySelector(".page-prev").onclick = () => navigatePage(-1);
  slide.querySelector(".page-next").onclick = () => navigatePage(1);
  pen.onclick = () => {
    slide.classList.add("annotation-active");
    pointer.classList.remove("chosen");
    erase = false;
    pen.classList.add("chosen");
    eraser.classList.remove("chosen");
    options.hidden = false;
  };
  eraser.onclick = () => {
    slide.classList.add("annotation-active");
    pointer.classList.remove("chosen");
    erase = true;
    eraser.classList.add("chosen");
    pen.classList.remove("chosen");
  };
  color.oninput = () => {
    slide.classList.add("annotation-active");
    pointer.classList.remove("chosen");
    erase = false;
    pen.classList.add("chosen");
    eraser.classList.remove("chosen");
  };
  slide.querySelectorAll(".swatch").forEach(
    (b) =>
      (b.onclick = () => {
        sharedPen.color = b.dataset.color;
        syncPen();
        color.dispatchEvent(new Event("input"));
      }),
  );
  const widthSlider = slide.querySelector(".width-slider");
  widthSlider.oninput = () => {
    sharedPen.width = +widthSlider.value;
    slide.classList.add("annotation-active");
    pointer.classList.remove("chosen");
    erase = false;
    pen.classList.add("chosen");
    eraser.classList.remove("chosen");
    ring.style.display = "none";
    syncPen();
  };
  slide.querySelector(".clear").onclick = () => {
    save();
    ctx.clearRect(0, 0, c.width, c.height);
    controls();
  };
  undo.onclick = () => {
    if (!history.length) return;
    future.push(state());
    restore(history.pop());
    controls();
  };
  redo.onclick = () => {
    if (!future.length) return;
    history.push(state());
    restore(future.pop());
    controls();
  };
  const ring = document.createElement("div");
  ring.className = "eraser-ring";
  slide.appendChild(ring);
  function updateRing(e) {
    if (!erase) {
      ring.style.display = "none";
      return;
    }
    let sr = slide.getBoundingClientRect(),
      scale = sr.width / 1600;
    ring.style.left = (e.clientX - sr.left) / scale + "px";
    ring.style.top = (e.clientY - sr.top) / scale + "px";
    ring.style.display = "block";
  }
  c.addEventListener("pointerenter", updateRing);
  c.addEventListener("pointermove", updateRing);
  c.addEventListener("pointerleave", () => {
    ring.style.display = "none";
  });
  pen.addEventListener("click", () => {
    ring.style.display = "none";
  });
  color.addEventListener("input", () => {
    ring.style.display = "none";
  });
  function pos(e) {
    let r = c.getBoundingClientRect();
    return [
      ((e.clientX - r.left) * c.width) / r.width,
      ((e.clientY - r.top) * c.height) / r.height,
    ];
  }
  let pending = false,
    origin = null,
    drawHold = null;
  function beginStroke() {
    save();
    controls();
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(...origin);
    ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
    ctx.strokeStyle = sharedPen.color;
    ctx.lineWidth = erase ? 28 : sharedPen.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }
  c.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    c.setPointerCapture(e.pointerId);
    origin = pos(e);
    pending = true;
    drawing = false;
    drawHold = setTimeout(() => {
      pending = false;
    }, 650);
  });
  c.addEventListener("pointermove", (e) => {
    let point = pos(e);
    if (pending && Math.hypot(point[0] - origin[0], point[1] - origin[1]) > 8) {
      clearTimeout(drawHold);
      pending = false;
      beginStroke();
    }
    if (drawing) {
      ctx.lineTo(...point);
      ctx.stroke();
    }
  });
  c.addEventListener("pointerup", () => {
    clearTimeout(drawHold);
    if (pending) {
      beginStroke();
      ctx.lineTo(origin[0] + 0.01, origin[1] + 0.01);
      ctx.stroke();
    }
    pending = false;
    drawing = false;
    ctx.beginPath();
  });
  ["pointercancel", "lostpointercapture"].forEach((type) =>
    c.addEventListener(type, () => {
      clearTimeout(drawHold);
      pending = false;
      drawing = false;
      ctx.beginPath();
    }),
  );
  controls();
}
document.querySelectorAll(".writing-slide").forEach(initWriting);
function navigatePage(direction) {
  if (lessonMode === "whiteboard") {
    let target = boardPosition + direction;
    if (target < 0 || target >= boardPages.length) return;
    boardPosition = target;
    page = slides.indexOf(boardPages[boardPosition]);
    reveal = 0;
  } else {
    let target = page + direction;
    while (
      target >= 0 &&
      target < slides.length &&
      slides[target].classList.contains("blank-board")
    )
      target += direction;
    if (target < 0 || target >= slides.length) return;
    page = target;
    reveal = 0;
  }
  show();
}
function updatePageTools() {
  let s = slides[page];
  if (!s) return;
  let left = s.querySelector(".page-prev"),
    right = s.querySelector(".page-next");
  if (!left || !right) return;
  if (lessonMode === "whiteboard") {
    left.disabled = boardPosition === 0;
    right.disabled = boardPosition >= boardPages.length - 1;
  } else {
    let list = slides.filter((x) => !x.classList.contains("blank-board")),
      idx = list.indexOf(s);
    left.disabled = idx <= 0;
    right.disabled = idx >= list.length - 1;
  }
}
function createBoard() {
  let fresh = document.createElement("section");
  fresh.className = "slide blank-board";
  stage.appendChild(fresh);
  prepareSlide(fresh);
  initWriting(fresh);
  slides.push(fresh);
  boardPages.push(fresh);
  let source = slides[presentationPage];
  boardSlide.set(fresh, { slide: source, reveal: presentationReveal });
  slideBoard.set(source, fresh);
}
function applyLessonMode() {
  document.querySelectorAll(".writing-slide").forEach((s) => {
    s.classList.toggle("annotation-active", lessonMode === "whiteboard");
    let indicator = s.querySelector(".mode-indicator");
    if (indicator)
      indicator.textContent =
        lessonMode === "whiteboard" ? "白板模式" : "放映模式";
    let b = s.querySelector(".mode-switch");
    if (b) {
      b.classList.toggle("chosen", lessonMode === "whiteboard");
      b.title =
        lessonMode === "whiteboard"
          ? "白板模式：点击切换为放映模式"
          : "放映模式：点击切换为白板模式";
      b.setAttribute("aria-label", b.title);
    }
  });
}
applyLessonMode();

/* 白板存档：手动保存为独立 JSON；按页面标识恢复笔迹及白板映射。 */
const archiveFormat = "html-math-whiteboard",
  archiveVersion = 1;

const archiveBaseSlides = slides.filter(
  (s) => !s.classList.contains("blank-board"),
);
let archiveFileInput = null,
  archiveToastTimer = null;
function archiveSlideId(slide) {
  const index = archiveBaseSlides.indexOf(slide);
  return index < 0 ? "" : String(index + 1);
}
function archiveCanvasImage(canvas) {
  const ctx = canvas.getContext("2d"),
    pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < pixels.length; i += 4)
    if (pixels[i] !== 0) return canvas.toDataURL("image/png");
  return null;
}
function archiveFilename(date = new Date()) {
  const z = (n, w = 2) => String(n).padStart(w, "0");
  const filename = decodeURIComponent(
    location.pathname.split("/").pop() || document.title,
  )
    .replace(/\.[^.]+$/, "")
    .replace(/[\\/:*?"<>|]/g, "_");
  return `${filename}_${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}_${z(date.getHours())}-${z(date.getMinutes())}-${z(date.getSeconds())}-${z(date.getMilliseconds(), 3)}.json`;
}
function captureWhiteboardSession() {
  const ids = archiveBaseSlides.map(archiveSlideId);
  if (ids.some((x) => !x) || new Set(ids).size !== ids.length)
    throw new Error("课件页面标识不完整或重复，无法保存．");
  const notes = [];
  for (const slide of archiveBaseSlides) {
    const png = archiveCanvasImage(slide.querySelector(".writing-canvas"));
    if (png) notes.push({ slideId: archiveSlideId(slide), png });
  }
  const boards = boardPages.map((board) => {
    const source = boardSlide.get(board);
    if (!source || !archiveSlideId(source.slide))
      throw new Error("白板与放映页的对应关系不完整．");
    return {
      sourceSlideId: archiveSlideId(source.slide),
      sourceReveal: source.reveal,
      png: archiveCanvasImage(board.querySelector(".writing-canvas")),
    };
  });
  const bindings = [];
  for (const [slide, board] of slideBoard) {
    const idx = boardPages.indexOf(board);
    if (idx < 0 || !archiveSlideId(slide))
      throw new Error("白板对应关系不完整．");
    bindings.push({ slideId: archiveSlideId(slide), boardIndex: idx });
  }
  const current = slides[page],
    link = lessonMode === "whiteboard" ? boardSlide.get(current) : null;
  const presentation =
    link?.slide ||
    (lessonMode === "presentation" ? current : slides[presentationPage]);
  const presentationStep =
    link?.reveal ??
    (lessonMode === "presentation" ? reveal : presentationReveal);
  return {
    format: archiveFormat,
    version: archiveVersion,
    savedAt: new Date().toISOString(),
    notes,
    boards,
    bindings,
    pen: { color: sharedPen.color, width: sharedPen.width },
    view: {
      mode: lessonMode,
      slideId: archiveSlideId(presentation),
      reveal: presentationStep,
      boardIndex:
        lessonMode === "whiteboard" ? boardPages.indexOf(current) : null,
    },
  };
}
function archiveNotify(message) {
  let toast = document.querySelector("#archive-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "archive-toast";
    toast.className = "archive-toast";
    toast.setAttribute("role", "status");
    stage.appendChild(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(archiveToastTimer);
  archiveToastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3500);
}
// 保存和读取共用位置标识，让浏览器记住本课件上次选择的文件夹。
function archivePickerId() {
  let hash = 2166136261;
  for (const ch of location.pathname) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return "whiteboard-" + (hash >>> 0).toString(16);
}
const archivePickerTypes = [
  { description: "白板记录", accept: { "application/json": [".json"] } },
];
async function saveWhiteboardArchive() {
  try {
    const session = captureWhiteboardSession(),
      contents = JSON.stringify(session),
      name = archiveFilename();
    if (typeof window.showSaveFilePicker === "function") {
      const handle = await window.showSaveFilePicker({
        id: archivePickerId(),
        suggestedName: name,
        types: archivePickerTypes,
      });
      const writable = await handle.createWritable();
      try {
        await writable.write(contents);
        await writable.close();
      } catch (error) {
        await writable.abort().catch(() => {});
        throw error;
      }
      archiveNotify("白板文件已保存");
    } else {
      const blob = new Blob([contents], {
          type: "application/json;charset=utf-8",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.hidden = true;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      archiveNotify("正在保存白板文件");
    }
  } catch (error) {
    if (error?.name !== "AbortError")
      alert("保存失败：" + (error?.message || "请重试．"));
  }
}
function decodeArchiveImage(png) {
  if (png === null) return Promise.resolve(null);
  if (
    typeof png !== "string" ||
    !png.startsWith("data:image/png;base64,") ||
    png.length > 25000000
  )
    throw new Error("笔迹图片格式不正确．");
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      image.naturalWidth === 1600 && image.naturalHeight === 900
        ? resolve(image)
        : reject(new Error("笔迹画布尺寸不匹配．"));
    image.onerror = () => reject(new Error("笔迹图片无法读取．"));
    image.src = png;
  });
}
async function loadWhiteboardSession(data, { confirmReplace = true } = {}) {
  if (!data || data.format !== archiveFormat || data.version !== archiveVersion)
    throw new Error("这不是支持的白板文件．");
  if (
    !Array.isArray(data.notes) ||
    !Array.isArray(data.boards) ||
    !Array.isArray(data.bindings)
  )
    throw new Error("白板文件内容不完整．");
  const byId = new Map(archiveBaseSlides.map((s) => [archiveSlideId(s), s]));
  if (byId.has("") || byId.size !== archiveBaseSlides.length)
    throw new Error("课件页面标识不完整或重复．");
  const validStep = (n) => Number.isInteger(n) && n >= 0;
  const seenNotes = new Set(),
    seenBindings = new Set();
  for (const note of data.notes) {
    if (
      !note ||
      !byId.has(note.slideId) ||
      seenNotes.has(note.slideId) ||
      note.png === null
    )
      throw new Error("有笔迹无法对应课件页面．");
    seenNotes.add(note.slideId);
  }
  for (const board of data.boards) {
    if (
      !board ||
      !byId.has(board.sourceSlideId) ||
      !validStep(board.sourceReveal)
    )
      throw new Error("有白板无法对应课件页面．");
  }
  for (const binding of data.bindings) {
    if (
      !binding ||
      !byId.has(binding.slideId) ||
      seenBindings.has(binding.slideId) ||
      !Number.isInteger(binding.boardIndex) ||
      binding.boardIndex < 0 ||
      binding.boardIndex >= data.boards.length ||
      data.boards[binding.boardIndex].sourceSlideId !== binding.slideId
    )
      throw new Error("白板对应关系不正确．");
    seenBindings.add(binding.slideId);
  }
  const view = data.view;
  if (
    !view ||
    !["presentation", "whiteboard"].includes(view.mode) ||
    !byId.has(view.slideId) ||
    !validStep(view.reveal) ||
    (view.mode === "whiteboard" &&
      (!Number.isInteger(view.boardIndex) ||
        view.boardIndex < 0 ||
        view.boardIndex >= data.boards.length))
  )
    throw new Error("白板页面位置不正确．");
  if (
    view.mode === "whiteboard" &&
    data.boards[view.boardIndex].sourceSlideId !== view.slideId
  )
    throw new Error("当前白板与放映页的对应关系不正确．");
  if (
    !data.pen ||
    !/^#[0-9a-f]{6}$/i.test(data.pen.color) ||
    !Number.isInteger(data.pen.width) ||
    data.pen.width < 1 ||
    data.pen.width > 16
  )
    throw new Error("画笔设置不正确．");
  const [noteImages, boardImages] = await Promise.all([
    Promise.all(data.notes.map((n) => decodeArchiveImage(n.png))),
    Promise.all(data.boards.map((b) => decodeArchiveImage(b.png))),
  ]);
  if (
    confirmReplace &&
    (boardPages.length > 0 ||
      archiveBaseSlides.some((s) =>
        archiveCanvasImage(s.querySelector(".writing-canvas")),
      )) &&
    !confirm(
      "读取会替换当前课件中的手写内容和白板页。尚未保存的内容将丢失，是否继续？",
    )
  )
    return false;
  function paint(slide, image) {
    const c = slide.querySelector(".writing-canvas"),
      ctx = c.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, c.width, c.height);
    if (image) ctx.drawImage(image, 0, 0);
    ctx.restore();
    slide._resetWhiteboardHistory?.();
  }
  for (const s of archiveBaseSlides) paint(s, null);
  for (let i = slides.length - 1; i >= 0; i--)
    if (slides[i].classList.contains("blank-board")) {
      slides[i].remove();
      slides.splice(i, 1);
    }
  boardPages = [];
  slideBoard.clear();
  boardSlide.clear();
  data.notes.forEach((n, i) => paint(byId.get(n.slideId), noteImages[i]));
  data.boards.forEach((b, i) => {
    presentationPage = slides.indexOf(byId.get(b.sourceSlideId));
    presentationReveal = b.sourceReveal;
    createBoard();
    paint(boardPages[boardPages.length - 1], boardImages[i]);
  });
  slideBoard.clear();
  data.bindings.forEach((b) =>
    slideBoard.set(byId.get(b.slideId), boardPages[b.boardIndex]),
  );
  sharedPen.color = data.pen.color;
  sharedPen.width = data.pen.width;
  syncPen();
  lessonMode = view.mode;
  presentationPage = slides.indexOf(byId.get(view.slideId));
  presentationReveal = view.reveal;
  if (lessonMode === "whiteboard") {
    boardPosition = view.boardIndex;
    page = slides.indexOf(boardPages[boardPosition]);
    reveal = 0;
  } else {
    page = presentationPage;
    reveal = Math.min(view.reveal, maxStep());
  }
  show();
  archiveNotify("白板内容已读取");
  return true;
}
async function openWhiteboardArchive() {
  if (typeof window.showOpenFilePicker === "function") {
    try {
      const [handle] = await window.showOpenFilePicker({
        id: archivePickerId(),
        multiple: false,
        types: archivePickerTypes,
      });
      const file = await handle.getFile();
      await loadWhiteboardSession(JSON.parse(await file.text()));
    } catch (error) {
      if (error?.name !== "AbortError")
        alert("读取失败：" + (error?.message || "文件格式不正确．"));
    }
    return;
  }
  if (!archiveFileInput) {
    archiveFileInput = document.createElement("input");
    archiveFileInput.type = "file";
    archiveFileInput.accept = ".json,application/json";
    archiveFileInput.hidden = true;
    document.body.appendChild(archiveFileInput);
    archiveFileInput.addEventListener("change", async () => {
      const file = archiveFileInput.files?.[0];
      archiveFileInput.value = "";
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        await loadWhiteboardSession(data);
      } catch (error) {
        alert("读取失败：" + (error?.message || "文件格式不正确．"));
      }
    });
  }
  archiveFileInput.click();
}

/* 练习页答案按需展开，覆盖在手写笔迹之上。 */
document.querySelectorAll(".exercise-solution-toggle").forEach((button) => {
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  if (!panel) return;
  button.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    button.setAttribute("aria-expanded", String(!panel.hidden));
  });
});

/* 鼠标模式下单击下一步、双击上一步，交互控件不参与翻步。 */
let mousePageClickTimer = null;
stage.addEventListener("click", (e) => {
  if (
    e.button !== 0 ||
    e.detail === 0 ||
    e.ctrlKey ||
    e.altKey ||
    e.metaKey ||
    e.shiftKey
  )
    return;
  const slide = slides[page],
    target = e.target;
  if (
    !slide ||
    slide.classList.contains("annotation-active") ||
    !slide.contains(target)
  )
    return;
  if (
    target.closest(
      "button,input,select,textarea,a,[contenteditable],.writing-tools,.exercise-solution-panel,[data-slide-drag],canvas:not(.writing-canvas)",
    )
  )
    return;
  if (window.getSelection()?.toString()) return;
  if (e.detail === 1) {
    clearTimeout(mousePageClickTimer);
    mousePageClickTimer = setTimeout(() => {
      mousePageClickTimer = null;
      if (
        slides[page] === slide &&
        !slide.classList.contains("annotation-active")
      )
        next();
    }, 330);
  } else if (e.detail === 2) {
    clearTimeout(mousePageClickTimer);
    mousePageClickTimer = null;
    prev();
  }
});

/* 滚轮对应左右方向键；同一次连续滚动只推进一步。 */
let wheelStepReady = true,
  wheelStepTimer = null;
window.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey || !event.deltaY) return;
    const target = event.target,
      tag = target?.tagName?.toUpperCase();
    if (
      target?.isContentEditable ||
      target?.closest?.(
        '[contenteditable]:not([contenteditable="false"]),input,select,textarea,.writing-tools',
      )
    )
      return;
    event.preventDefault();
    if (wheelStepReady) {
      wheelStepReady = false;
      if (event.deltaY > 0) next();
      else prev();
    }
    clearTimeout(wheelStepTimer);
    wheelStepTimer = setTimeout(() => {
      wheelStepReady = true;
    }, 220);
  },
  { passive: false },
);
