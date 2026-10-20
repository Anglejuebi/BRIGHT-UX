/* ==========================================================================
   BRIGHT 智能阅片系统 — page behaviour
   Vanilla ES modules. No dependencies, no build step.
   ========================================================================== */

const CONFIG = window.BRIGHT_CONFIG || {};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const root = document.documentElement;
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

/* OS-level reduced motion always wins over the in-page switch. */
if (motionQuery.matches) root.classList.add("motion-off");
let motionOn = !root.classList.contains("motion-off");
let particles = null;
let stopLayerDemo = () => {};

/* --------------------------------------------------------------------------
   Application URL (single runtime source: assets/js/config.js)
   -------------------------------------------------------------------------- */

const appUrl = typeof CONFIG.appUrl === "string" ? CONFIG.appUrl.trim() : "";
if (appUrl) {
  $$("[data-app-link]").forEach((link) => {
    link.href = appUrl;
    if (/^https?:/i.test(appUrl)) {
      link.target = "_blank";
      link.rel = "noopener";
    }
  });
}

/* --------------------------------------------------------------------------
   Sticky header state
   -------------------------------------------------------------------------- */

const header = $("#site-header");
if (header) {
  const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 6);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

/* --------------------------------------------------------------------------
   Mobile menu
   -------------------------------------------------------------------------- */

const menuButton = $(".menu-toggle");
const mobileMenu = $("#mobile-menu");
let menuOpen = false;

function setMenu(open, returnFocus = false) {
  if (!menuButton || !mobileMenu) return;
  menuOpen = open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  mobileMenu.hidden = !open;
  if (!open && returnFocus) menuButton.focus();
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => setMenu(!menuOpen));
  $$("a", mobileMenu).forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });
  const wide = window.matchMedia("(min-width: 981px)");
  const closeOnWide = (event) => { if (event.matches && menuOpen) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener("change", closeOnWide);
  else if (wide.addListener) wide.addListener(closeOnWide);
}

/* --------------------------------------------------------------------------
   Section-aware navigation state
   -------------------------------------------------------------------------- */

const navLinks = $$(".nav-links a[data-nav]");

if (navLinks.length) {
  const navForSection = {
    overview: "overview",
    reading: "reading",
    layers: "reading",
    annotation: "annotation",
    upload: "annotation",
    team: "team",
    start: "team"
  };
  const navSections = ["overview", "reading", "layers", "annotation", "upload", "team", "start"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const setCurrent = (sectionId) => {
    const navId = navForSection[sectionId] || "overview";
    navLinks.forEach((link) => {
      if (link.dataset.nav === navId) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };
  let navQueued = false;
  const syncNav = () => {
    navQueued = false;
    let current = navSections[0];
    navSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 150) current = section;
    });
    if (current) setCurrent(current.id);
  };
  const queueNavSync = () => {
    if (navQueued) return;
    navQueued = true;
    requestAnimationFrame(syncNav);
  };

  const initial = navLinks.find((link) => link.hash === window.location.hash) || navLinks[0];
  navLinks.forEach((link) => {
    if (link === initial) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  window.addEventListener("scroll", queueNavSync, { passive: true });
  window.addEventListener("resize", queueNavSync);
  syncNav();
}

/* --------------------------------------------------------------------------
   Accessible tabs
   -------------------------------------------------------------------------- */

function initTabs(tablist) {
  if (!tablist) return null;
  const tabs = $$('[role="tab"]', tablist);
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
  let index = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));

  function select(next, options = {}) {
    const { focus = false, silent = false } = options;
    index = (next + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = panels[i];
      if (!panel) return;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    if (focus) tabs[index].focus();
    if (!silent) {
      tablist.dispatchEvent(
        new CustomEvent("bright:tabchange", {
          detail: { index, tab: tabs[index], panel: panels[index] }
        })
      );
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (event) => {
      let target = null;
      if (event.key === "ArrowRight") target = index + 1;
      else if (event.key === "ArrowLeft") target = index - 1;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = tabs.length - 1;
      if (target === null) return;
      event.preventDefault();
      select(target, { focus: true });
    });
  });

  select(index, { silent: true });
  return {
    select,
    tabs,
    get index() { return index; }
  };
}

const layerTabs = initTabs($("#layer-tabs"));
initTabs($("#team-tabs"));

/* --------------------------------------------------------------------------
   Layers: one-shot auto demo (no loop)
   -------------------------------------------------------------------------- */

const playButton = $("#play-layers");
let demoTimer = 0;

function stopDemo() {
  if (demoTimer) {
    window.clearTimeout(demoTimer);
    demoTimer = 0;
  }
  if (playButton) {
    playButton.setAttribute("aria-pressed", "false");
    playButton.textContent = "自动演示一次";
  }
}
stopLayerDemo = stopDemo;

if (playButton && layerTabs) {
  const canAnimate = () => motionOn && !motionQuery.matches;

  function startDemo() {
    if (!canAnimate()) {
      playButton.textContent = "系统已开启“减少动态效果”";
      window.setTimeout(() => { playButton.textContent = "自动演示一次"; }, 1800);
      return;
    }
    stopDemo();
    playButton.setAttribute("aria-pressed", "true");
    playButton.textContent = "停止演示";
    let remaining = 2;
    const step = () => {
      layerTabs.select(layerTabs.index + 1);
      remaining -= 1;
      if (remaining > 0) demoTimer = window.setTimeout(step, 1900);
      else stopDemo();
    };
    demoTimer = window.setTimeout(step, 1500);
  }

  playButton.addEventListener("click", () => {
    if (playButton.getAttribute("aria-pressed") === "true") stopDemo();
    else startDemo();
  });

  const tablist = $("#layer-tabs");
  if (tablist) {
    tablist.addEventListener("pointerdown", stopDemo);
    tablist.addEventListener("keydown", stopDemo);
  }

  if ("IntersectionObserver" in window) {
    const layers = document.getElementById("layers");
    if (layers) {
      new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) stopDemo();
        },
        { threshold: 0.08 }
      ).observe(layers);
    }
  }
}

/* --------------------------------------------------------------------------
   Reading view: overview / detail (same system, two captures)
   -------------------------------------------------------------------------- */

const readingImage = $("#reading-image");
const readingCaption = $("#reading-caption");
const readingStage = readingImage ? readingImage.closest(".reading-stage") : null;
const readingButtons = $$(".seg[data-view]");

const readingViews = {
  overview: {
    src: "assets/img/bright-reading-overview.webp",
    srcset: "assets/img/bright-reading-overview-960.webp 960w, assets/img/bright-reading-overview.webp 1440w",
    alt: "BRIGHT 阅片界面：314 切片 0.2X 全局概览，左右两侧分别显示原始图像与分割结果，右侧打开图层设置。",
    caption: "314 切片 · 全局概览 · 0.2X"
  },
  detail: {
    src: "assets/img/bright-reading-detail.webp",
    srcset: "assets/img/bright-reading-detail-960.webp 960w, assets/img/bright-reading-detail.webp 1440w",
    alt: "BRIGHT 阅片界面：5.2X 局部视野，左侧为原始 H&E 切片，右侧为分割标注结果。",
    caption: "314 切片 · 局部视野 · 5.2X"
  }
};

function setReadingView(view) {
  const data = readingViews[view];
  if (!data || !readingImage) return;
  readingButtons.forEach((button) => {
    const on = button.dataset.view === view;
    button.classList.toggle("is-active", on);
    button.setAttribute("aria-pressed", String(on));
  });
  if (readingImage.getAttribute("src") === data.src) return;

  if (readingStage) readingStage.classList.add("is-switching");
  readingImage.src = data.src;
  readingImage.srcset = data.srcset;
  readingImage.alt = data.alt;
  if (readingCaption) readingCaption.textContent = data.caption;

  const settle = () => readingStage && readingStage.classList.remove("is-switching");
  if (readingImage.complete) window.requestAnimationFrame(settle);
  else {
    readingImage.addEventListener("load", settle, { once: true });
    readingImage.addEventListener("error", settle, { once: true });
  }
}

readingButtons.forEach((button) => {
  button.addEventListener("click", () => setReadingView(button.dataset.view));
});

Object.values(readingViews).forEach((view) => {
  const image = new Image();
  image.srcset = view.srcset;
  image.sizes = "(max-width: 980px) 92vw, 760px";
  image.src = view.src;
});

/* --------------------------------------------------------------------------
   Compare slider (static same-view crop)
   -------------------------------------------------------------------------- */

const compareRange = $(".compare-range");
const compareStage = $(".compare-stage");

if (compareRange && compareStage) {
  const labels = $$(".compare-label", compareStage);
  const updateCompare = () => {
    const value = Number(compareRange.value);
    compareStage.style.setProperty("--pos", value + "%");
    if (labels[0]) labels[0].style.opacity = value < 10 ? "0" : "1";
    if (labels[1]) labels[1].style.opacity = value > 90 ? "0" : "1";
    compareRange.setAttribute(
      "aria-valuetext",
      value + "% 原始图像 / " + (100 - value) + "% 分割结果"
    );
  };
  compareRange.addEventListener("input", updateCompare);
  updateCompare();
}

/* --------------------------------------------------------------------------
   Upload hotspots
   -------------------------------------------------------------------------- */

const hotspots = $$(".hotspot");
const hotspotCopies = $$("[data-copy]");

hotspots.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.hotspot;
    hotspots.forEach((item) => {
      const on = item === button;
      item.classList.toggle("is-active", on);
      item.setAttribute("aria-expanded", String(on));
    });
    hotspotCopies.forEach((copy) => {
      copy.hidden = copy.dataset.copy !== key;
    });
  });
});

/* --------------------------------------------------------------------------
   Lightbox
   -------------------------------------------------------------------------- */

const lightbox = $("#lightbox");
const lightboxImage = $("#lightbox-img");
const lightboxTitle = $("#lightbox-title");
const lightboxNote = $("#lightbox-note");
const lightboxClose = $("#lightbox-close");
let lightboxTrigger = null;

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage) return;
  const target = trigger.dataset.lightboxTarget;
  const image = $("img", trigger) || (target ? $(target) : null);
  if (!image) return;
  lightboxTrigger = trigger;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt || "";
  lightboxTitle.textContent = trigger.dataset.title || "系统界面";
  lightboxNote.textContent = trigger.dataset.note || "系统界面实录";
  root.classList.add("lb-open");
  if (typeof lightbox.showModal === "function") lightbox.showModal();
  else lightbox.setAttribute("open", "");
}

function closeLightbox() {
  if (!lightbox) return;
  if (typeof lightbox.close === "function" && lightbox.open) lightbox.close();
  else {
    lightbox.removeAttribute("open");
    root.classList.remove("lb-open");
    if (lightboxTrigger) lightboxTrigger.focus();
  }
}

$$("[data-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => openLightbox(trigger));
});

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("close", () => {
    root.classList.remove("lb-open");
    lightboxImage.removeAttribute("src");
    if (lightboxTrigger) lightboxTrigger.focus();
    lightboxTrigger = null;
  });
}

/* --------------------------------------------------------------------------
   Reveal on scroll + one-time step emphasis
   -------------------------------------------------------------------------- */

const revealElements = $$(".reveal");
const steps = $("#steps");
const reduceAtLoad = motionQuery.matches || !motionOn;

if (!("IntersectionObserver" in window) || reduceAtLoad) {
  revealElements.forEach((element) => element.classList.add("is-in"));
  if (steps) steps.classList.add("is-lit");
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  revealElements.forEach((element) => revealObserver.observe(element));

  if (steps) {
    const stepsObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        steps.classList.add("is-lit");
        observer.disconnect();
      },
      { threshold: 0.32 }
    );
    stepsObserver.observe(steps);
  }
}

/* --------------------------------------------------------------------------
   Particle field: one canvas, one loop, no pointer capture
   -------------------------------------------------------------------------- */

class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dots = [];
    this.raf = 0;
    this.running = false;
    this.enabled = true;
    this.visible = true;
    this.last = 0;
    this.w = 0;
    this.h = 0;
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    this.sync = this.sync.bind(this);

    window.addEventListener("resize", this.resize, { passive: true });
    document.addEventListener("visibilitychange", this.sync);

    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          this.visible = entries[0].isIntersecting;
          this.sync();
        },
        { threshold: 0 }
      );
      this.observer.observe(canvas);
    }

    this.resize();
    this.sync();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.makeDots();
    this.draw();
  }

  makeDot() {
    const windowWidth = Math.min(this.w - 48, 1240);
    const margin = Math.max(0, (this.w - windowWidth) / 2);
    const sideRoom = margin - 10;
    const useSide = this.w > 900 && sideRoom > 34;
    let x;
    let y;

    if (useSide && Math.random() < 0.62) {
      const left = Math.random() < 0.5;
      x = left
        ? 6 + Math.random() * sideRoom
        : this.w - 6 - Math.random() * sideRoom;
      y = 150 + Math.random() * Math.max(60, this.h - 250);
    } else {
      x = 16 + Math.random() * Math.max(1, this.w - 32);
      y = this.h - 68 + Math.random() * 48;
    }

    return {
      x,
      y,
      r: 0.8 + Math.random() * 1.0,
      a: 0.12 + Math.random() * 0.18,
      vx: (Math.random() - 0.5) * 0.012,
      vy: -0.004 - Math.random() * 0.012,
      phase: Math.random() * Math.PI * 2,
      drift: 0.004 + Math.random() * 0.008
    };
  }

  makeDots() {
    const count = this.w < 720 ? 9 : Math.round(Math.min(34, Math.max(24, this.w / 48)));
    this.dots = Array.from({ length: count }, () => this.makeDot());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.dots.forEach((dot) => {
      ctx.beginPath();
      ctx.fillStyle = "rgba(128, 89, 111, " + dot.a.toFixed(3) + ")";
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  tick(now) {
    if (!this.running) return;
    const dt = Math.min(now - this.last || 16, 40);
    this.last = now;
    this.dots.forEach((dot) => {
      dot.x += dot.vx * dt;
      dot.y +=
        (dot.vy + Math.sin((now / 1000) * dot.drift + dot.phase) * 0.004) * dt;
      if (dot.y < -4) {
        dot.y = this.h + 4;
        dot.x = 16 + Math.random() * Math.max(1, this.w - 32);
      }
      if (dot.x < -4) dot.x = this.w + 4;
      if (dot.x > this.w + 4) dot.x = -4;
    });
    this.draw();
    this.raf = window.requestAnimationFrame(this.tick);
  }

  sync() {
    const shouldRun = this.enabled && this.visible && !document.hidden;
    if (shouldRun && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = window.requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.running) {
      this.running = false;
      window.cancelAnimationFrame(this.raf);
      this.draw();
    }
  }

  setEnabled(on) {
    this.enabled = on;
    this.sync();
  }
}

const canvas = $("#particle-canvas");
if (canvas && canvas.getContext) {
  particles = new ParticleField(canvas);
  particles.setEnabled(motionOn && !motionQuery.matches);
}

/* --------------------------------------------------------------------------
   Motion switch
   -------------------------------------------------------------------------- */

const motionButton = $("#motion-toggle");

function applyMotion(on, persist = true) {
  if (on && motionQuery.matches) {
    if (motionButton) motionButton.title = "系统已开启“减少动态效果”";
    return;
  }
  motionOn = on;
  root.classList.toggle("motion-off", !on);
  if (motionButton) {
    motionButton.setAttribute("aria-pressed", String(on));
    motionButton.title = on ? "关闭动态效果" : "开启动态效果";
  }
  if (persist) {
    try {
      localStorage.setItem("bright-motion", on ? "on" : "off");
    } catch (error) {
      /* private mode: preference simply does not persist */
    }
  }
  if (!on) {
    revealElements.forEach((element) => element.classList.add("is-in"));
    if (steps) steps.classList.add("is-lit");
    stopLayerDemo();
    if (particles) particles.setEnabled(false);
  } else if (particles) {
    particles.setEnabled(true);
  }
  window.dispatchEvent(new CustomEvent("bright:motion", { detail: { on } }));
}

if (motionButton) {
  motionButton.setAttribute("aria-pressed", String(motionOn));
  motionButton.title = motionOn ? "关闭动态效果" : "开启动态效果";
  if (motionQuery.matches) motionButton.title = "系统已开启“减少动态效果”";
  motionButton.addEventListener("click", () => applyMotion(!motionOn));
}

const onMotionPreferenceChange = (event) => {
  let stored = null;
  try {
    stored = localStorage.getItem("bright-motion");
  } catch (error) {
    stored = null;
  }
  if (stored) return;
  applyMotion(!event.matches, false);
};

if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionPreferenceChange);
else if (motionQuery.addListener) motionQuery.addListener(onMotionPreferenceChange);

window.addEventListener("bright:motion", (event) => {
  if (event.detail && !event.detail.on) stopLayerDemo();
});
