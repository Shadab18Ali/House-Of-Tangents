# Implementation notes (V2: Electric Editorial)

**Baseline (V1).** Static multi-page site: cream/charcoal/orange palette, Open Sans, text-only cards, no project imagery, Drive iframes. Homepage 7,470 px desktop / 13,047 px mobile. See `docs/screenshots/before-*`.

**V2 art direction.** Cool white `#F7F8FA`, ink `#0B0D12`, cobalt `#3157FF`, signal lime `#C8FF3D`, mist `#E9ECF4`. Bricolage Grotesque (display), Manrope (body), Instrument Serif (accent only), all self-hosted as Latin WOFF2 in `assets/fonts/`. Motif: a line touching a circle at one lime point.

**What changed.** `styles.css` rewritten from scratch (tokens, components). `scripts/build.mjs` templates rewritten. Homepage order: hero with muted reel, selected work, evidence band, services index, method journey, origin, team and testimonial, contact. `/work` is a mixed-ratio visual wall. Case studies lead with media, then facts, challenge and tangent, evidence modules, media, credits, related work and a next-project CTA.

**Kept.** Routes, content model and validation, evidence qualifications, status labels, form API, skip link, focus handling, metadata and structured data.

**Tests.** `npm test` (19 tests): content rules, metadata, overflow at five viewports, first-viewport CTA, menu focus, filters, dialog, form, palette and font rules, WCAG contrast of the token pairs, hero media, reduced motion, services index.
