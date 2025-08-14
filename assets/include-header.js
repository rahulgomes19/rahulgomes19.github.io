(async function injectHeader(){
  const mount = document.getElementById("site-header");
  if (!mount) return;

  try {
    // fetch header partial (cache-busted on first load if needed)
    const res = await fetch("/partials/header.html");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    mount.innerHTML = html;

    // After injection, set active nav link based on current path
    const path = window.location.pathname.replace(/\/+$/, "") || "/index.html";
    const links = mount.querySelectorAll(".site-nav a");
    links.forEach(a => {
      const href = (a.getAttribute("href") || "").replace(/\/+$/, "");
      if (href && (path.endsWith(href) || (href === "/index.html" && (path === "/" || path === "")))) {
        a.classList.add("active");
      }
    });

  } catch (e) {
    console.error("Header include failed:", e);
    mount.innerHTML = `<div style="padding:12px;border:1px solid var(--border);border-radius:8px;">
      <strong>Header failed to load.</strong>
    </div>`;
  }
})();
