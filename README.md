# House of Tangents website

Static site generated from structured content. No framework and no build step on the host.

```bash
node scripts/build.mjs          # regenerate every page from content/
node --test tests/*.test.mjs    # 52 checks (needs Playwright available)
```

Edit `content/`, rebuild, and commit the generated HTML. See `docs/handoff.md` for pages, missing assets and integrations, and `docs/asset-manifest.md` for the media already in use.

## Deploying
Vercel deploys the `claude/kind-davinci-a1gvgz` branch to production, so a push to it goes live. Vercel only builds a commit whose author email matches a GitHub account (use the account email or its noreply address); otherwise the deployment is marked "Blocked".

Contact form: set `RESEND_API_KEY`, `CONTACT_FROM` and `CONTACT_TO` in Vercel.
