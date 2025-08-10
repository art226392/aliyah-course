/* progress.js */
(function () {
  const QUIZ_PAGES = ["quiz1.html", "quiz2.html", "quiz3.html", "quiz4.html"];
  const COURSE_PAGES = [
    "index.html",
    "lecture2.html",
    "lecture3.html",
    "lecture4.html",
    ...QUIZ_PAGES,
  ];

  function currentPage() {
    const p = location.pathname.split("/").pop() || "index.html";
    return p.includes("?") ? p.split("?")[0] : p;
  }

  function getUserId() {
    // Try to read from whatever your sign-in sets.
    // If you store email somewhere, mirror it into localStorage under 'ac:email'.
    const fromGlobal =
      (window.currentUser &&
        (window.currentUser.email || window.currentUser.id)) ||
      null;
    const fromLS = localStorage.getItem("ac:email");
    return (fromGlobal || fromLS || "anon").toLowerCase();
  }

  function key(k) {
    return `ac:${getUserId()}:${k}`;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(key("state"));
      return raw ? JSON.parse(raw) : { completed: {}, lastVisited: null };
    } catch {
      return { completed: {}, lastVisited: null };
    }
  }

  function saveState(s) {
    localStorage.setItem(key("state"), JSON.stringify(s));
  }

  function setLastVisited(page) {
    const s = loadState();
    s.lastVisited = page;
    saveState(s);
  }

  function markQuizComplete(page, passed) {
    if (!QUIZ_PAGES.includes(page)) return;
    const s = loadState();
    if (passed) s.completed[page] = true;
    saveState(s);
    renderHeader(); // refresh bar after finishing
  }

  function computeProgress() {
    const s = loadState();
    const total = QUIZ_PAGES.length;
    const done = QUIZ_PAGES.filter((q) => s.completed[q]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }

  function nextIncomplete() {
    const s = loadState();
    return QUIZ_PAGES.find((q) => !s.completed[q]) || null;
  }

  function pickContinueTarget() {
    const s = loadState();
    if (s.lastVisited && s.lastVisited !== currentPage()) return s.lastVisited;
    const next = nextIncomplete();
    if (next && next !== currentPage()) return next;
    // Fallback: go to first lecture if everything is done or we’re already on target
    return "index.html";
  }

  function ensureHeaderShell() {
    if (document.getElementById("ac-header")) return;

    const bar = document.createElement("div");
    bar.id = "ac-header";
    bar.innerHTML = `
    <div class="ac-header-inner">
      <div class="ac-title">Aliyah Course</div>
      <div class="ac-progress-wrap">
        <div class="ac-progress-label"></div>
        <div class="ac-progress-track"><div class="ac-progress-fill"></div></div>
      </div>
      <button class="ac-continue" type="button">Continue</button>
    </div>
  `;

    // mount after your site header/nav if present; otherwise prepend to body
    const anchor = document.querySelector("header, nav, .site-header, #topnav");
    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement("afterend", bar);
    } else {
      document.body.prepend(bar);
    }

    bar.querySelector(".ac-continue").addEventListener("click", () => {
      const target = pickContinueTarget();
      if (target) location.href = target;
    });
  }

  function injectStyles() {
    if (document.getElementById("ac-style")) return;
    const css = document.createElement("style");
    css.id = "ac-style";
    css.textContent = `
    /* make the header full-bleed even inside centered/grid wrappers */
    #ac-header {
      position: relative;
      width: 100vw;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
      grid-column: 1 / -1; /* if the body/page is a grid, span all columns */
      z-index: 1; /* sit behind sticky navs that use higher z-index */
      background: #0b1b3a; color: #fff;
    }

    #ac-header .ac-header-inner {
      max-width: 1100px; margin: 0 auto; padding: 10px 16px;
      display: grid; grid-template-columns: 1fr 2fr auto; gap: 12px; align-items: center;
    }

    #ac-header .ac-title { font-weight: 600; }
    #ac-header .ac-progress-wrap { display: grid; gap: 6px; }
    #ac-header .ac-progress-track { height: 8px; background: rgba(255,255,255,0.2); border-radius: 999px; overflow: hidden; }
    #ac-header .ac-progress-fill { height: 100%; width: 0%; background: #5cc2ff; transition: width 250ms ease; }
    #ac-header .ac-continue { background: #1e90ff; border: 0; padding: 8px 14px; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 600; }
    #ac-header .ac-continue:hover { filter: brightness(1.05); }
    @media (max-width: 720px) { #ac-header .ac-header-inner { grid-template-columns: 1fr; } }
  `;
    document.head.appendChild(css);
  }

  function renderHeader() {
    ensureHeaderShell();
    const { done, total, pct } = computeProgress();
    const label = document.querySelector("#ac-header .ac-progress-label");
    const fill = document.querySelector("#ac-header .ac-progress-fill");
    label.textContent = `Quizzes completed: ${done}/${total}`;
    fill.style.width = pct + "%";
    fill.setAttribute("aria-valuenow", String(pct));
  }

  // Style inject so you don’t have to edit CSS files (you can move this to style.css later)
  function injectStyles() {
    if (document.getElementById("ac-style")) return;
    const css = document.createElement("style");
    css.id = "ac-style";
    css.textContent = `
      #ac-header { width: 100%; background: #0b1b3a; color: #fff; }
      #ac-header .ac-header-inner { max-width: 1100px; margin: 0 auto; padding: 10px 16px; display: grid; grid-template-columns: 1fr 2fr auto; gap: 12px; align-items: center; }
      #ac-header .ac-title { font-weight: 600; }
      #ac-header .ac-progress-wrap { display: grid; gap: 6px; }
      #ac-header .ac-progress-track { height: 8px; background: rgba(255,255,255,0.2); border-radius: 999px; overflow: hidden; }
      #ac-header .ac-progress-fill { height: 100%; width: 0%; background: #5cc2ff; transition: width 250ms ease; }
      #ac-header .ac-continue { background: #1e90ff; border: 0; padding: 8px 14px; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 600; }
      #ac-header .ac-continue:hover { filter: brightness(1.05); }
      @media (max-width: 720px) {
        #ac-header .ac-header-inner { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(css);
  }

  // Record last visited and draw header
  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    setLastVisited(currentPage());
    renderHeader();
  });

  // Expose a tiny API quizzes can call after grading
  window.AliyahCourse = { markQuizComplete };
})();
