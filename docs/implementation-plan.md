# Redesign implementation notes

**Baseline.** The previous site was a single static page (`index.html` + JS-rendered case studies), about 6,000 words long, with no build, lint or tests, and Google Drive iframes/thumbnails as its media pipeline. It had no routes, metadata per page, sitemap, form, or accessibility work.

**Approach.** Still framework-free so it deploys on Vercel with preset "Other" and no build step. Pages are generated from structured content and committed:

- `content/projects.json` — 24 case studies (status, period, categories, services, challenge, tangent, outcome, chapters, metrics, videos, related). Validated on every build: required fields, allowed statuses, no `Proposed` items in the project list, valid related links, max six featured, every video has a description.
- `content/site.mjs` — verified site facts, team, services, video descriptions.
- `scripts/build.mjs` — generates `/`, `/work`, `/work/<slug>` (24), `/services`, `/about`, `/tangent-media`, `/contact`, `/credits`, `404.html`, `sitemap.xml`, `robots.txt`.
- `styles.css`, `site.js` — design tokens, components, menu, video dialog, filters, form.
- `api/contact.js` — Vercel function for the enquiry form.
- `tests/site.test.mjs` — 12 tests (`npm test`).

**Edit workflow.** Change content in `content/`, run `node scripts/build.mjs`, commit the regenerated HTML.
