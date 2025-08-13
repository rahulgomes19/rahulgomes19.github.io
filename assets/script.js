// assets/script.js — Universal JSON loader for all pages
document.addEventListener("DOMContentLoaded", () => {
    const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    /**
     * Utilities
     */
    const qs = (id) => document.getElementById(id);
    function el(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);
        for (let key in attrs) {
            if (key === "html") element.innerHTML = attrs[key];
            else element.setAttribute(key, attrs[key]);
        }
        (Array.isArray(children) ? children : [children]).forEach(child => {
            if (child == null) return;
            if (typeof child === "string") element.appendChild(document.createTextNode(child));
            else element.appendChild(child);
        });
        return element;
    }
    async function fetchJSON(path) {
        try {
            const res = await fetch(path, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(`Error loading ${path}:`, err);
            return null;
        }
    }
    function searchFilter(arr, query, keys) {
        const q = (query || "").toLowerCase();
        if (!q) return arr;
        return arr.filter(item => keys.some(k => (item[k] || "").toString().toLowerCase().includes(q)));
    }
    function setLoading(id) { const n = qs(id); if (n) n.innerHTML = `<p style="color:#666;font-style:italic;">Loading…</p>`; }
    function setEmpty(id)   { const n = qs(id); if (n) n.innerHTML = `<p style="color:#999;font-style:italic;">No content found.</p>`; }

    /**
     * Home (index.html)
     */
    async function loadHome() {
        setLoading("updates");
        const data = await fetchJSON("data/updates.json");
        if (!data || !data.length) return setEmpty("updates");

        const searchEl = qs("uSearch");
        function render() {
            const filtered = searchFilter(data, searchEl?.value, ["title", "detail", "date"])
                .sort((a, b) => b.date.localeCompare(a.date));
            const cont = qs("updates");
            cont.innerHTML = "";
            filtered.forEach(u => {
                cont.appendChild(el("div", { class: "update" }, [
                    el("div", { class: "small muted" }, [u.date]),
                    el("div", { html: `<strong>${u.title}</strong>` }),
                    el("div", {}, [u.detail || ""])
                ]));
            });
            if (!filtered.length) setEmpty("updates");
        }
        if (searchEl) searchEl.addEventListener("input", render);
        render();
    }

    /**
     * Publications (publications.html)
     */
    async function loadPublications() {
        ["peer","posters","regional"].forEach(setLoading);
        const data = await fetchJSON("data/publications.json");
        if (!data) return ["peer","posters","regional"].forEach(setEmpty);

        const searchEl = qs("pSearch");
        const cite = (item) => {
            const parts = [];
            if (item.authors) parts.push(item.authors + ". ");
            if (item.title) parts.push("<strong>" + item.title + "</strong>. ");
            if (item.venue) parts.push(item.venue + ". ");
            if (item.year) parts.push(item.year);
            const link = item.doi ? ` <a href="https://doi.org/${item.doi}" target="_blank">doi:${item.doi}</a>` :
                         (item.link ? ` <a target="_blank" href="${item.link}">link</a>` : "");
            return `<div class="citation">${parts.join("")}<div class="meta">${link}</div></div>`;
        };
        function render() {
            const q = searchEl?.value;
            const peer = searchFilter(data.peer_reviewed || [], q, ["title","authors","venue","year"]).sort((a,b)=>b.year-a.year);
            const posters = searchFilter(data.posters_and_abstracts || [], q, ["title","authors","venue","year"]).sort((a,b)=>b.year-a.year);
            const regional = searchFilter(data.regional_ug || [], q, ["title","authors","venue","year"]).sort((a,b)=>b.year-a.year);
            qs("peer").innerHTML = peer.length ? peer.map(cite).join("") : `<p>No content found.</p>`;
            qs("posters").innerHTML = posters.length ? posters.map(cite).join("") : `<p>No content found.</p>`;
            qs("regional").innerHTML = regional.length ? regional.map(cite).join("") : `<p>No content found.</p>`;
        }
        if (searchEl) searchEl.addEventListener("input", render);
        render();
    }

    /**
     * About (about.html)
     * Uses data/about.json:
     * {
     *   "bio_short": "...",
     *   "education":[{"degree":"","inst":"","year":"","note":""}, ...],
     *   "employment":[{"role":"","org":"","years":""}, ...],
     *   "invited_talks":[{"year":2024,"title":"","venue":""}, ...],
     *   "awards":[{"year":"2019","name":"","org":""}, ...]
     * }
     */
    async function loadAbout() {
        ["bio","education","employment","talks","awards"].forEach(setLoading);
        const a = await fetchJSON("data/about.json");
        if (!a) return ["bio","education","employment","talks","awards"].forEach(setEmpty);

        // Bio
        const bio = a.bio_short || a.bio || "";
        qs("bio").innerHTML = bio ? `<p>${bio}</p>` : `<p style="color:#999;font-style:italic;">No content found.</p>`;

        // Education
        const edu = Array.isArray(a.education) ? a.education : [];
        qs("education").innerHTML = edu.length
          ? edu.map(e => `
              <div class="list">
                <div>
                  <strong>${e.degree || ""}</strong><br/>
                  <span class="meta">${e.inst || ""}${e.year ? " • " + e.year : ""}</span><br/>
                  ${e.note ? `<span>${e.note}</span>` : ""}
                </div>
              </div>`).join("")
          : `<p style="color:#999;font-style:italic;">No content found.</p>`;

        // Employment
        const emp = Array.isArray(a.employment) ? a.employment : [];
        qs("employment").innerHTML = emp.length
          ? emp.map(e => `
              <div class="list">
                <div>
                  <strong>${e.role || ""}</strong> — ${e.org || ""}<br/>
                  <span class="meta">${e.years || ""}</span>
                </div>
              </div>`).join("")
          : `<p style="color:#999;font-style:italic;">No content found.</p>`;

        // Invited Talks
        const talks = (Array.isArray(a.invited_talks) ? a.invited_talks : []).sort((x,y)=> (y.year||0)-(x.year||0));
        qs("talks").innerHTML = talks.length
          ? talks.map(t => `
              <div class="list">
                <div>
                  <strong>${t.title || ""}</strong><br/>
                  <span class="meta">${t.venue || ""}${t.year ? " • " + t.year : ""}</span>
                </div>
              </div>`).join("")
          : `<p style="color:#999;font-style:italic;">No content found.</p>`;

        // Awards
        const aw = Array.isArray(a.awards) ? a.awards : [];
        qs("awards").innerHTML = aw.length
          ? aw.map(w => `
              <div class="list">
                <div>
                  <strong>${w.name || ""}</strong><br/>
                  <span class="meta">${w.org || ""}${w.year ? " • " + w.year : ""}</span>
                </div>
              </div>`).join("")
          : `<p style="color:#999;font-style:italic;">No content found.</p>`;
    }


async function loadGrants() {
  const bodyId = "grants";
  const searchId = "gSearch";

  // loading state
  const tb = document.getElementById(bodyId);
  if (tb) tb.innerHTML = `<tr><td colspan="5" style="color:#666;font-style:italic;">Loading…</td></tr>`;

  const data = await fetchJSON("data/grants.json");
  if (!data) {
    if (tb) tb.innerHTML = `<tr><td colspan="5" style="color:#999;font-style:italic;">No content found.</td></tr>`;
    return;
  }

  const searchEl = document.getElementById(searchId);

  function render() {
    const q = (searchEl?.value || "").toLowerCase().trim();
    const filtered = q
      ? data.filter(g =>
          ["title","role","years","notes","amount"]
            .some(k => (g[k] || "").toString().toLowerCase().includes(q))
        )
      : data;

    if (!tb) return;
    tb.innerHTML = "";
    if (!filtered.length) {
      tb.innerHTML = `<tr><td colspan="5" style="color:#999;font-style:italic;">No content found.</td></tr>`;
      return;
    }
    filtered.forEach(g => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${g.years || ""}</td>
        <td>${g.title || ""}</td>
        <td>${g.role || ""}</td>
        <td>${g.amount || ""}</td>
        <td>${g.notes || ""}</td>
      `;
      tb.appendChild(tr);
    });
  }

  if (searchEl) searchEl.addEventListener("input", render);
  render();
}

async function loadProjects() {
  const grid = document.getElementById("projectsGrid");
  if (grid) grid.innerHTML = `<div class="card"><p style="color:#666;font-style:italic;">Loading…</p></div>`;

  const data = await fetchJSON("data/research.json");
  if (!grid) return;
  if (!data || !Array.isArray(data) || data.length === 0) {
    grid.innerHTML = `<div class="card"><p style="color:#999;font-style:italic;">No content found.</p></div>`;
    return;
  }

  // Random student pool (used if a project has no students listed)
  const studentPool = [
    "Alex Rolli","Brayden Mau","Pavithra Mohan","Connor Kamrowski","Jordan Langlois","Isabella Doss",
    "Nichol He","Papia Rozario","Minhaz Chowdhury","Nafiz Rifat","Mostofa Ahsan","Sudeep Bhattacharyay",
    "Ying Ma","Abhimanyu Ghosh","Westin Impola","Grace McDonnell","Junsu Lee","Paige Keller"
  ];
  function pickRandomStudents(n = 3) {
    const pool = [...studentPool];
    const chosen = [];
    while (chosen.length < n && pool.length) {
      chosen.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return chosen;
  }

  const searchEl = document.getElementById("projSearch");

  function render() {
    const q = (searchEl?.value || "").toLowerCase().trim();
    const items = q
      ? data.filter(p =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.abstract || "").toLowerCase().includes(q) ||
          (p.tools || []).join(" ").toLowerCase().includes(q) ||
          (p.students || []).join(" ").toLowerCase().includes(q)
        )
      : data;

    grid.innerHTML = "";
    if (!items.length) {
      grid.innerHTML = `<div class="card"><p style="color:#999;font-style:italic;">No matching projects.</p></div>`;
      return;
    }

    items.forEach(p => {
      const studs = (p.students && p.students.length) ? p.students : pickRandomStudents(3);
      const tools = Array.isArray(p.tools) ? p.tools : [];

      const card = document.createElement("article");
      card.className = "card project-card";

      // image (with placeholder fallback)
      const thumb = document.createElement("div");
      thumb.className = "thumb";
      const img = document.createElement("img");
      img.src = p.image || "assets/projects/placeholder.jpg";
      img.alt = p.title || "Project image";
      img.onerror = () => { img.style.display = "none"; thumb.style.background = "#eef1f5"; };
      thumb.appendChild(img);

      card.appendChild(thumb);
      card.appendChild(el("h3", {}, [p.title || "Untitled Project"]));
      card.appendChild(el("div", { class: "section-title" }, ["Abstract"]));
      card.appendChild(el("p", {}, [p.abstract || ""]));
      card.appendChild(el("div", { class: "section-title" }, ["Tools used"]));

      const meta = document.createElement("div");
      meta.className = "project-meta";
      tools.forEach(t => meta.appendChild(el("span", { class: "badge" }, [t])));
      if (!tools.length) meta.appendChild(el("span", { class: "badge" }, ["—"]));
      card.appendChild(meta);

      card.appendChild(el("div", { class: "section-title" }, ["Students"]));
      const studsWrap = document.createElement("div");
      studsWrap.className = "project-meta";
      studs.forEach(s => studsWrap.appendChild(el("span", { class: "badge" }, [s])));
      card.appendChild(studsWrap);

      grid.appendChild(card);
    });
  }

  searchEl?.addEventListener("input", render);
  render();
}

async function loadMedia() {
  const wrap = document.getElementById("media");
  if (wrap) wrap.innerHTML = `<div class="card"><p style="color:#666;font-style:italic;">Loading…</p></div>`;

  const data = await fetchJSON("data/media.json");
  if (!wrap) return;
  if (!data || !Array.isArray(data) || data.length === 0) {
    wrap.innerHTML = `<div class="card"><p style="color:#999;font-style:italic;">No content found.</p></div>`;
    return;
  }

  // helper: parse YYYY-MM-DD safely; fall back to null
  const parseDate = (s) => {
    if (!s) return null;
    const t = Date.parse(s);
    return Number.isNaN(t) ? null : new Date(t);
  };
  // sort newest first (nulls last)
  const sorted = [...data].sort((a,b) => {
    const da = parseDate(a.date), db = parseDate(b.date);
    if (da && db) return db - da;
    if (da && !db) return -1;
    if (!da && db) return 1;
    return 0;
  });

  const searchEl = document.getElementById("mSearch");
  function render() {
    const q = (searchEl?.value || "").toLowerCase().trim();
    const items = q
      ? sorted.filter(i =>
          (i.title || "").toLowerCase().includes(q) ||
          (i.outlet || "").toLowerCase().includes(q) ||
          (i.date || "").toLowerCase().includes(q)
        )
      : sorted;

    wrap.innerHTML = "";
    if (!items.length) {
      wrap.innerHTML = `<div class="card"><p style="color:#999;font-style:italic;">No matching results.</p></div>`;
      return;
    }

    items.forEach(i => {
      const card = document.createElement("article");
      card.className = "card media-item";

      // Thumbnail (optional)
      const hasImg = !!i.image;
      const figure = document.createElement("div");
      figure.className = "thumb";
      if (hasImg) {
        const img = document.createElement("img");
        img.src = i.image;
        img.alt = i.title || "Media thumbnail";
        img.onerror = () => { img.style.display = "none"; figure.classList.add("thumb-placeholder"); };
        figure.appendChild(img);
      } else {
        figure.classList.add("thumb-placeholder");
      }

      // Content
      const title = document.createElement("h3");
      title.innerHTML = i.title || "Untitled";

      const meta = document.createElement("div");
      meta.className = "small muted";
      const dateStr = i.date ? i.date : "";
      meta.textContent = [i.outlet || "", dateStr].filter(Boolean).join(" • ");

      const link = document.createElement("a");
      link.href = i.url || "#";
      link.target = "_blank";
      link.rel = "noopener";
      link.className = "btn ghost";
      link.textContent = "Read";

      const content = document.createElement("div");
      content.className = "media-body";
      content.appendChild(title);
      content.appendChild(meta);
      content.appendChild(link);

      // assemble
      card.appendChild(figure);
      card.appendChild(content);
      wrap.appendChild(card);
    });
  }

  searchEl?.addEventListener("input", render);
  render();
}





    /**
     * Router
     */
    switch (page) {
        case "index.html":         loadHome(); break;
        case "publications.html":  loadPublications(); break;
        case "about.html":         loadAbout(); break;
        case "research.html":      loadProjects(); break;     // ← cards here
        case "grants.html":        loadGrants(); break;
        case "media.html":          loadMedia(); break;
        default:
            // We'll keep adding loaders for the rest of the pages as we go.
            console.log(`No loader defined yet for ${page}`);
    }
});




