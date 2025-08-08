// assets/script.js

document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop().toLowerCase() || "index.html";

    // Search input (if present)
    const searchInput = document.querySelector("#searchBox");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filterContent(searchInput.value.trim().toLowerCase());
        });
    }

    // Show loading placeholder
    const contentContainer = document.querySelector("#content");
    if (contentContainer) {
        contentContainer.innerHTML = `<p style="color:#666;font-style:italic;">Loading…</p>`;
    }

    // Page-specific data loader
    switch (page) {
        case "index.html":
            loadJSON("data/about.json", renderHomeBio);
            loadJSON("data/updates.json", renderUpdates);
            break;

        case "about.html":
            loadJSON("data/about.json", renderAbout);
            break;

        case "research.html":
            loadJSON("data/research.json", renderResearch);
            break;

        case "students.html":
            loadJSON("data/students.json", renderStudents);
            break;

        case "teaching.html":
            loadJSON("data/teaching.json", renderTeaching);
            break;

        case "publications.html":
            loadJSON("data/publications.json", renderPublications);
            break;

        case "grants.html":
            loadJSON("data/grants.json", renderGrants);
            break;

        case "media.html":
            loadJSON("data/media.json", renderMedia);
            break;

        case "contact.html":
            loadJSON("data/contact.json", renderContact);
            break;

        default:
            console.warn(`No loader defined for ${page}`);
    }

    /**
     * Generic JSON loader with error handling
     */
    function loadJSON(path, callback) {
        fetch(path)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (callback) callback(data);
            })
            .catch(err => {
                console.error(`Error loading ${path}:`, err);
                if (contentContainer) {
                    contentContainer.innerHTML = `<p style="color:red;">Could not load content. Please try again later.</p>`;
                }
            });
    }

    /**
     * Filter function for search
     */
    function filterContent(query) {
        const items = document.querySelectorAll(".list-item, .card, .pub-item");
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? "" : "none";
        });
    }

    // ---- Render functions for each page ----

    function renderHomeBio(data) {
        const el = document.querySelector("#homeBio");
        if (el) el.textContent = data.bio || "";
    }

    function renderUpdates(data) {
        const el = document.querySelector("#recentUpdates");
        if (!el) return;
        el.innerHTML = "";
        data.forEach(update => {
            const div = document.createElement("div");
            div.className = "list-item";
            div.innerHTML = `<strong>${update.date} — ${update.title}</strong><br><span>${update.description}</span>`;
            el.appendChild(div);
        });
    }

    function renderAbout(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = `
            <h2>Biography</h2><p>${data.bio}</p>
            <h3>Education</h3><ul>${data.education.map(e => `<li>${e}</li>`).join("")}</ul>
            <h3>Employment</h3><ul>${data.employment.map(e => `<li>${e}</li>`).join("")}</ul>
            <h3>Invited Talks</h3><ul>${data.talks.map(t => `<li>${t}</li>`).join("")}</ul>
            <h3>Awards & Scholarships</h3><ul>${data.awards.map(a => `<li>${a}</li>`).join("")}</ul>
        `;
    }

    function renderResearch(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = "";
        data.forEach(proj => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `<h3>${proj.title}</h3><p>${proj.description}</p>`;
            el.appendChild(div);
        });
    }

    function renderStudents(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = "";
        data.forEach(stu => {
            const div = document.createElement("div");
            div.className = "list-item";
            div.innerHTML = `<strong>${stu.name}</strong> — ${stu.role} (${stu.since})<br><span>${stu.focus}</span>`;
            el.appendChild(div);
        });
    }

    function renderTeaching(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = "";
        data.forEach(course => {
            const div = document.createElement("div");
            div.className = "list-item";
            div.innerHTML = `<strong>${course.code}: ${course.title}</strong> (${course.term} ${course.year})`;
            el.appendChild(div);
        });
    }

    function renderPublications(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = "";
        data.forEach(pub => {
            const div = document.createElement("div");
            div.className = "pub-item";
            div.innerHTML = `<p><strong>${pub.title}</strong><br>${pub.authors} — ${pub.venue}, ${pub.year} ${pub.link ? `<a href="${pub.link}" target="_blank">[DOI]</a>` : ""}</p>`;
            el.appendChild(div);
        });
    }

    function renderGrants(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = "";
        data.forEach(grant => {
            const div = document.createElement("div");
            div.className = "list-item";
            div.innerHTML = `<strong>${grant.title}</strong> — ${grant.role}, ${grant.years} (${grant.amount})<br><span>${grant.summary}</span>`;
            el.appendChild(div);
        });
    }

    function renderMedia(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = "";
        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "list-item";
            div.innerHTML = `<strong>${item.title}</strong> — ${item.source} (${item.year}) ${item.link ? `<a href="${item.link}" target="_blank">[Read]</a>` : ""}`;
            el.appendChild(div);
        });
    }

    function renderContact(data) {
        const el = document.querySelector("#content");
        if (!el) return;
        el.innerHTML = `
            <p>Email: <a href="mailto:${data.email}">${data.email}</a></p>
            <p>Office: ${data.office}</p>
            <p>Phone: ${data.phone}</p>
            <p>Profiles: 
                <a href="${data.scholar}" target="_blank">Google Scholar</a> | 
                <a href="${data.wos}" target="_blank">Web of Science</a>
            </p>
        `;
    }
});
