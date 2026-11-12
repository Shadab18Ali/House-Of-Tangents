# House of Tangents website

Static site generated from structured content. Deploys on Vercel (preset "Other", no build command).

```bash
node scripts/build.mjs        # regenerate all pages from content/
node --test tests/*.test.mjs  # tests (need Playwright available)
```

Routes: `/`, `/work`, `/work/<slug>`, `/services`, `/about`, `/tangent-media`, `/contact`, `/credits`.
Edit `content/projects.json` and `content/site.mjs`, then rebuild and commit the generated HTML.

Media: see `docs/asset-manifest.md` and `scripts/make-media.md`.

Contact form: set `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` in Vercel. See `docs/` for the plan, asset manifest and open questions.
