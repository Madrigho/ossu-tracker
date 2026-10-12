// ==UserScript==
// @name         OSSU Auto-Complete
// @namespace    ossu-tracker
// @version      0.1
// @description  Tick the next checklist item in your OSSU CS Progress Tracker when you mark a lesson complete.
// @author       you
// @match        https://www.py4e.com/*
// @match        https://py4e.com/*
// @match        https://www.coursera.org/*
// @match        https://www.edx.org/*
// @match        https://learning.edx.org/*
// @match        https://www.freecodecamp.org/*
// @match        https://*.youtube.com/*
// @match        https://ocw.mit.edu/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const TRACKER = "http://localhost:1420";

  // ---------- Course mapping ----------
  // Edit this list to pin site/URL patterns to specific tracker course ids.
  // Matching is case-insensitive substring on the full URL.
  // The tracker course id is the slug shown in the Auto-tick dropdown
  // (e.g. "python-for-everyone").
  const URL_MAP = [
    ["py4e.com",                             "python-for-everyone"],
    ["coursera.org/learn/python",            "python-for-everyone"],
    ["cs50",                                 "introduction-to-computer-science"],
    ["edx.org/learn/cs50",                   "introduction-to-computer-science"],
    ["ocw.mit.edu/6.0001",                   "introduction-to-computer-science"],
    ["ocw.mit.edu/6.042",                    "math-for-computer-science"],
    ["freecodecamp.org/learn/javascript",    "introduction-to-programming"],
    ["freecodecamp.org/learn/responsive",    "introduction-to-programming"],
  ];

  function guessCourse() {
    const url = location.href.toLowerCase();
    for (const [needle, id] of URL_MAP) {
      if (url.includes(needle.toLowerCase())) return id;
    }
    return "";
  }

  // Try to guess "Week 3" or "Chapter 2" from the page title or top heading.
  function guessItem() {
    const heading = document.querySelector("h1,h2");
    const text = (document.title || "") + " " + (heading?.textContent || "");
    const week = text.match(/week\s*(\d+)/i);
    if (week) return "Week " + week[1];
    const ch = text.match(/(chapter|lesson|module|unit|lecture)\s*(\d+)/i);
    if (ch) return ch[1].charAt(0).toUpperCase() + ch[1].slice(1) + " " + ch[2];
    return "";
  }

  // ---------- Ping ----------
  function ping(courseId, itemHint) {
    if (!courseId) {
      flash("No course mapping for this URL - edit URL_MAP in the userscript");
      console.warn("[ossu-auto] no course mapping for", location.href);
      return;
    }
    const url = TRACKER + "/?ossu_auto=1"
      + "&course=" + encodeURIComponent(courseId)
      + (itemHint ? "&item=" + encodeURIComponent(itemHint) : "");
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden";
    frame.src = url;
    document.body.appendChild(frame);
    setTimeout(() => frame.remove(), 5000);
    flash("Sent: " + courseId + (itemHint ? " -> " + itemHint : ""));
  }

  // ---------- Toast ----------
  let toastEl;
  function flash(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.style.cssText = "position:fixed;bottom:64px;right:16px;z-index:2147483647;"
        + "background:#047857;color:#fff;padding:8px 12px;border-radius:6px;"
        + "font:13px/1.3 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25);"
        + "transition:opacity .2s;pointer-events:none;max-width:320px";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = "1";
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => { toastEl.style.opacity = "0"; }, 2500);
  }

  // ---------- Auto-detect "mark complete" clicks ----------
  // Heuristic only - looks for buttons whose text/label contains a completion word.
  function isLikelyCompleteClick(target) {
    if (!(target instanceof Element)) return false;
    const btn = target.closest("button, [role='button'], a, input[type='submit']");
    if (!btn) return false;
    const text = ((btn.textContent || "") + " " + (btn.getAttribute("aria-label") || "") + " " + (btn.getAttribute("title") || "")).toLowerCase();
    return /\b(complete|completed|finish|finished|submit|done|next)\b/.test(text);
  }

  document.addEventListener("click", (e) => {
    if (!isLikelyCompleteClick(e.target)) return;
    // Debounce: don't fire twice within 3s (some sites re-emit)
    const now = Date.now();
    if (document._ossuLastPing && now - document._ossuLastPing < 3000) return;
    document._ossuLastPing = now;
    ping(guessCourse(), guessItem());
  }, true);

  // ---------- Floating button (universal fallback) ----------
  function addFloatingButton() {
    const btn = document.createElement("button");
    btn.textContent = "✓ Mark done in OSSU";
    btn.title = "Tick the next checklist item in your tracker";
    btn.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483646;"
      + "background:#047857;color:#fff;border:0;padding:8px 12px;border-radius:6px;"
      + "font:13px/1.3 system-ui,sans-serif;cursor:pointer;"
      + "box-shadow:0 2px 8px rgba(0,0,0,.25);opacity:.92";
    btn.onmouseenter = () => { btn.style.opacity = "1"; };
    btn.onmouseleave = () => { btn.style.opacity = ".92"; };
    btn.onclick = () => ping(guessCourse(), guessItem());
    document.body.appendChild(btn);
  }

  if (!location.href.startsWith("http://localhost:1420")) {
    addFloatingButton();
  }

  console.log("[ossu-auto] loaded on", location.href, "- course:", guessCourse() || "(unmapped)");
})();
