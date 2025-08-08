// assets/script.js — Universal JSON loader for all pages
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop().toLowerCase() || "index.html";

    /**
     * Utility functions
     */
    function qs(id) {
        return document.getElementById(id);
    }
    function el(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);
        for (let key in attrs) {
            if (key === "html") element.innerHTML = attrs[key];
            else element.setAttribute(key, attrs[key]);
        }
        children.forEach(child => {
            if (typeof child === "string") element.appendChild(document.createTextNode(child));
            else element.appendChild(child);
        });
        return element;
    }
    async function fetchJSON(path) {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(`Error loading ${path}:`, err);
            return null;
        }
    }
    function searchFilter(arr, query, keys) {
        if (!query) return arr;
        return arr.filter(item => keys.some(k => (item[k] || "").toString().toLowerCase().includes(query)));
    }
    function showLoading(containerId) {
        const elC = qs(containerId);
        if (elC) elC.innerHTML = `<p style="color:#666;font-style:italic;">Loading…</p>`;
    }
    function showEmpty(containerId) {
        const elC = qs(containerId);
        if (elC) elC.innerHTML = `<p style="color:#999;font-style:italic;">No content found.</p>`;
    }

    /**
     * Page renderers
     */
    async function loadHome() {
        showLoading("updates");
        const data = await fetchJSON("data/updates.json");
        if (!data || !data.length) return showEmpty("updates");

        const searchEl = qs("uSearch");
        function renderList() {
            const q = searchEl ? searchEl.value.trim().toLowerCase() : "";
            const filtered = searchFilter(data, q, ["title", "detail", "date"]);
            const cont = qs("updates");
            cont.innerHTML = "";
            filtered.sort((a, b) => b.date.localeCompare(a.date)).forEach(u => {
                cont.appendChild(el("div", { class: "update" }, [
                    el("div", { class: "small muted" }, [u.date]),
                    el("div", { html: `<strong>${u.title}</strong>` }),
                    el("div", {}, [u.detail || ""])
                ]));
            });
            if (!filtered.length) showEmpty("updates");
        }
        if (searchEl) searchEl.addEventListener("input", renderList);
        renderList();
    }

    async function loadPublications() {
        showLoading("peer");
        showLoading("posters");
        showLoading("regional");

        const data = await fetchJSON("data/publications.json");
        if (!data) return [showEmpty("peer"), showEmpty("posters"), showEmpty("regional")];

        const searchEl = qs("pSearch");
        function cite(item) {
            const parts = [];
            if (item.authors) parts.push(item.authors + ". ");
            if (item.title) parts.push("<strong>" + item.title + "</strong>. ");
            if (item.venue) parts.push(item.venue + ". ");
            if (item.year) parts.push(item.year);
            const doi = item.doi ? ` <a href="https://doi.org/${item.doi}" target="_blank">doi:${item.doi}</a>` :
                (item.link ? ` <a target="_blank" href="${item.link}">link</a>` : "");
            return `<div class="citation">${parts.join("")}<div class="meta">${doi}</div></div>`;
        }
        function renderList() {
            const q = searchEl ? searchEl.value.trim().toLowerCase() : "";
            const peer = searchFilter(data.peer_reviewed || [], q, ["title", "authors", "venue", "year"]);
            const posters = searchFilter(data.posters_and_abstracts || [], q, ["title", "authors", "venue", "year"]);
            const regional = searchFilter(data.regional_ug || [], q, ["title", "authors", "venue", "year"]);
            qs("peer").innerHTML = peer.length ? peer.sort((a, b) => b.year - a.year).map(cite).join("") : `<p>No content found.</p>`;
            qs("posters").innerHTML = posters.length ? posters.sort((a, b) => b.year - a.year).map(cite).join("") : `<p>No content found.</p>`;
            qs("regional").innerHTML = regional.length ? regional.sort((a, b) => b.year - a.year).map(cite).join("") : `<p>No content found.</p>`;
        }
        if (searchEl) searchEl.addEventListener("input", renderList);
        renderList();
    }

    // TODO: add similar loaders for grants, students, teaching, media, about, contact
    // We'll implement them as we update each page.

    /**
     * Page routing
     */
    switch (page) {
        case "index.html":
            loadHome();
            break;
        case "publications.html":
            loadPublications();
            break;
        default:
            console.log(`No loader defined yet for ${page}`);
    }
});
