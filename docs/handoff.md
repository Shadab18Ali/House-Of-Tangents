# Implementation handoff (agency portfolio rework, November 2026)

Not published or deployed by this work. See "Deploying" in the README before pushing: this branch deploys to production.

## Pages
`/` (banner slot, film reference, HOT Results, HOT Media, services, Tangent Media, people, invitation), `/work` (chapter and sector filters, additional experience), `/hot-results`, `/hot-media`, `/brand-identities`, `/services`, `/about`, `/tangent-media`, `/contact`, `/credits`, and 24 case studies at `/work/<slug>` (existing URLs kept). Aura is a section of Capitol Hill; Sora, Solace and Sparrow are sections of Moksh.

## Where content lives
- `content/projects.json`: one record per project (sector, chapters, dated status, overview, challenge, approach, deliverables, result records with period, paid/organic basis and source, context, credits, media, related).
- `content/pages.mjs`: homepage cards, media archive, identities, results groups, Tangent Media stories and proposed formats, process, notes.
- `content/site.mjs`: contact details, chapter explanations, team, services.
- `content/assets.json`: the editable asset manifest. Set `src`, `w`, `h`, `alt` and rebuild.
- `node scripts/build.mjs` regenerates the pages. `node --test tests/*.test.mjs` runs 52 checks.

## Missing assets (pages use typographic layouts until supplied)
Homepage banner; Wasseypur artwork (the supplied dialogue is set in type meanwhile); four team portraits and any group photo; approved logos and guidelines for all 14 identities; website screenshots; print and merchandise images; campaign creatives beyond Majestic India and Navdurga; film files or posters for Santhal Strikers, Sundowner, Zoha, Dense and the coronation (these play from Drive after a click).

## Missing integrations
The contact form posts to `api/contact.js`, which needs `RESEND_API_KEY`, `CONTACT_FROM` and `CONTACT_TO` in Vercel. Without them it reports a failure and shows the email and phone details. It never shows success unless delivery succeeds. No real enquiry was sent in testing.

## Decisions to confirm
- With no banner supplied, the hero keeps the existing muted reel of delivered work. The banner replaces it as soon as `homepageBanner.src` is set.
- Majestic India is filed under the "Personal branding" sector filter, following the brief's "Pageants and personal branding" grouping. Saregama fits none of the eight sectors and appears under "All sectors" only.
- The Pi, Dimechain, QuZones, i-Fit.Me and Unfaked have no status in the records, so none is shown.
- The Navdurga connectivity-map creative and the journey film print place names and distances as published by the client. Our own copy uses none.
- Colours and type stay as previously approved (lavender, powder blue, peach, deep indigo; Playfair Display and Inter).
- Contestant permissions and photographer credits for the Majestic India images are still unconfirmed.
