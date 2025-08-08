
# Rahul Gomes — Academic Website

A lightweight, multi-page academic website in a **light theme** with serif headings and UW–Eau Claire colors.  
Content is loaded from JSON files so you can update publications, grants, students, media, and updates without editing HTML.

## Structure
- `index.html` — Home + Recent Updates
- `about.html` — Bio, Education, Employment, Invited Talks, Awards
- `research.html` — Research overview + grants table
- `students.html` — Students & team
- `teaching.html` — Courses taught
- `publications.html` — Full citations (peer-reviewed, posters, regional)
- `grants.html` — Grants only (also listed in Research)
- `media.html` — Media coverage
- `contact.html` — Contact & profile links
- `cv.html` — Embedded / downloadable CV
- `data/*.json` — Content files
- `assets/style.css` — Styling
- `assets/script.js` — JSON loader + search utilities

## Update Content
Edit the JSON files in `data/`:
- `publications.json`
- `grants.json`
- `students.json`
- `teaching.json`
- `media.json`
- `updates.json`
- `about.json`

Then commit and push — no HTML changes needed.

## Deploy to GitHub Pages
Option A — User site (recommended):
1. Create a public repo named `yourusername.github.io`.
2. Add all files from this folder to the repo root.
3. Commit & push.
4. Visit `https://yourusername.github.io` after 1–2 minutes.

Option B — Project site:
1. Create a public repo with any name.
2. Push files to the repo root (or `/docs` if you prefer).
3. In **Settings → Pages**, choose **Branch: `main` (or `gh-pages`)** and **/ (root)**.
4. Save and wait for the green check.

## Customization
- Update site title and affiliation in `assets/header` (duplicated per page inside the template). Search for `Rahul Gomes, Ph.D.` to change.
- Replace colors by editing `:root` variables in `assets/style.css`.
- Add students: edit `data/students.json`.
- Add publications: edit `data/publications.json` (keep fields: `year`, `title`, `authors`, `venue`, `doi` and/or `link`).

## License
MIT — Feel free to adapt for your lab.
