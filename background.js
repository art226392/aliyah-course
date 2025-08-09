// background.js

(function () {
  // ===== One-time disclaimer =====
  document.addEventListener("DOMContentLoaded", () => {
    try {
      if (!localStorage.getItem("aliyah_disclaimer_ack")) {
        const overlay = document.createElement("div");
        overlay.setAttribute("id", "disclaimer-overlay");
        overlay.setAttribute(
          "style",
          `
          position: fixed; inset: 0; display: grid; place-items: center;
          background: rgba(0,0,0,0.55); z-index: 9999; padding: 16px;
        `
        );

        const box = document.createElement("div");
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute(
          "style",
          `
          max-width: 560px; width: 100%; background: #fff; border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2); padding: 20px; line-height: 1.5;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        `
        );

        const h = document.createElement("h2");
        h.textContent = "Quick note before you start";
        h.setAttribute("style", "margin: 0 0 10px; font-size: 20px;");

        const p = document.createElement("p");
        p.textContent =
          "For best understanding, please watch the full lecture videos. The notes are support material and do not replace the video content.";

        const btn = document.createElement("button");
        btn.textContent = "Got it";
        btn.setAttribute(
          "style",
          `
          margin-top: 14px; padding: 10px 14px; border: 0; border-radius: 8px;
          background: #0f6; cursor: pointer; font-weight: 600;
        `
        );
        btn.addEventListener("click", () => {
          localStorage.setItem("aliyah_disclaimer_ack", "1");
          overlay.remove();
        });

        box.appendChild(h);
        box.appendChild(p);
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
      }
    } catch (_) {
      /* ignore storage issues */
    }
  });

  // ===== Quiz timer (12 minutes) =====
  const QUIZ_LIMIT_SECONDS = 12 * 60;

  function mmss(totalSeconds) {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  function finishQuiz(reason) {
    try {
      if (typeof window.computeResults === "function") {
        window.computeResults();
      }
    } catch (_) {
      /* best effort */
    }

    try {
      const msg = document.getElementById("result-message");
      if (msg && reason === "time") {
        msg.textContent = "Time is up. Your answers were submitted.";
      }
    } catch (_) {}

    const map = {
      "/quiz1.html": "lecture2.html",
      "/quiz2.html": "lecture3.html",
      "/quiz3.html": "lecture4.html",
    };

    const fallback = "index.html";
    const next = window.nextLecture || map[location.pathname] || fallback;

    setTimeout(() => {
      location.href = next;
    }, 1500);
  }

  function startQuizTimer() {
    const display = document.getElementById("timer");
    if (!display) return;

    let remaining = QUIZ_LIMIT_SECONDS;
    display.textContent = mmss(remaining);
    display.setAttribute("aria-live", "polite");

    const t = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(t);
        display.textContent = "00:00";
        finishQuiz("time");
      } else {
        display.textContent = mmss(remaining);
      }
    }, 1000);

    const finishBtn = document.getElementById("finishBtn");
    if (finishBtn) {
      finishBtn.addEventListener("click", () => finishQuiz("manual"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startQuizTimer);
  } else {
    startQuizTimer();
  }
})();
