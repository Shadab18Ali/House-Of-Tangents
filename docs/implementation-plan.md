# Implementation notes (V3: editorial redesign)

**Audit before changing anything.** The V2 site was a static, generated multi-page site (no framework). It contained five decorative SVG sites (hero tangent overlay, tangent line, geometric poster art, journey line, logo mark) and about 35 rounded-corner rules, a bright cobalt palette, stat-poster cards and repeated card grids. Content, routes, validation, API route, metadata and tests were sound and were kept.

**Kept (not rebuilt).** Routes and URLs, `content/*.json` data and its validation, structured data and canonical tags, `api/contact.js`, the form behaviour, skip link, menu focus trap, video dialog, filters, reduced-motion handling, sitemap and robots.

**Replaced.** `styles.css` (new tokens and components) and the page templates in `scripts/build.mjs`.

**Design system.**
- Colours: Powder Blue `#8DB9F0`, Soft Lavender White `#E9E8F8`, Warm Sunset Peach `#F5B69E`; Deep Charcoal `#191919`, Pure White `#FFFFFF`; one text tint `#3D3D3D` for secondary copy. Brand colours are surfaces only. Text is always charcoal (or lavender/peach on charcoal), which keeps every pair above 4.5:1.
- Type: Playfair Display (headings, figures, quotes), Inter (body, labels). Self-hosted Latin WOFF2. Lining numerals enforced.
- Shape: `border-radius: 0` globally. Thin 1px rules instead of shadows. No gradients, shadows, blur or SVG.
- Layout: asymmetric image-led feature pair, ruled index lists for everything else, a results list instead of stat cards, two case-study hero types (media / typographic) and two body layouts.

**Tests.** `npm test` runs 27 checks. New in V3: exact brand hex values, banned old colours and fonts, zero radius in CSS and in the rendered DOM, no inline SVG or decorative class names, no gradients or shadows, status grouping on `/work`, case-study structure and variation, alt text and local asset existence, no console errors.
