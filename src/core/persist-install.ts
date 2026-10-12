/**
 * Side-effect module imported once at app start.
 *  - Wraps localStorage.setItem so quota/private-mode failures surface as an
 *    "ossu:storage-error" event instead of being silently swallowed.
 *  - Injects a fixed red banner at the top when that event fires.
 *  - Adds Ctrl+Shift+S to download a full backup of the current state.
 */
const orig = localStorage.setItem.bind(localStorage);
localStorage.setItem = (k: string, v: string) => {
  try {
    orig(k, v);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    window.dispatchEvent(new CustomEvent("ossu:storage-error", { detail: msg }));
    throw e;
  }
};

const installBanner = () => {
  if (document.getElementById("ossu-safety-banner")) return;
  const el = document.createElement("div");
  el.id = "ossu-safety-banner";
  el.style.cssText =
    "display:none;position:fixed;top:0;left:0;right:0;z-index:99999;" +
    "padding:8px 16px;background:#fee;color:#900;border-bottom:1px solid #900;" +
    "font:13px/1.4 system-ui,sans-serif;";
  document.body.appendChild(el);

  const render = (msg: string) => {
    el.innerHTML = "";
    const b = document.createElement("b"); b.textContent = "Save failed: "; el.appendChild(b);
    el.appendChild(document.createTextNode(msg + ". Your last change may not have been stored. "));

    const dl = document.createElement("button");
    dl.textContent = "Download last backup";
    dl.style.cssText = "margin-left:8px;text-decoration:underline;background:none;border:0;color:inherit;cursor:pointer;";
    dl.onclick = () => {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith("ossu.backup."))
        .sort()
        .reverse();
      if (!keys[0]) return;
      const data = localStorage.getItem(keys[0]) ?? "{}";
      const blob = new Blob([data], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
      a.download = `ossu-recovery-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
    el.appendChild(dl);

    const x = document.createElement("button");
    x.textContent = "×";
    x.setAttribute("aria-label", "Dismiss");
    x.style.cssText = "margin-left:12px;background:none;border:0;color:inherit;cursor:pointer;font-size:15px;";
    x.onclick = () => { el.style.display = "none"; };
    el.appendChild(x);

    el.style.display = "block";
  };

  window.addEventListener("ossu:storage-error", (e) => {
    render((e as CustomEvent<string>).detail || "unknown error");
  });
};

if (typeof window !== "undefined") {
  if (document.body) installBanner();
  else window.addEventListener("DOMContentLoaded", installBanner);
}

export {};