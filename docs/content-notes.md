# Content notes and open questions for the client

Sources: the pasted portfolio text (all pages) and PDF pages 1–4 (visually checked). **A full 69-page PDF-vs-text comparison was not performed**, so no PDF/text conflicts were verified or ruled out beyond those pages. Where claims were ambiguous, the more cautious wording was used.

**Open items (V5 additions first)**
0000a. Supplied Graphics zip is now used on Majestic India and Navdurga. Please confirm model/contestant permissions and photographer credits for the Sita and Naina images.

000a. Capitol Hill 800%+ baseline (from what, to what) is not in the source data.
000b. Tanushree's surname; client logo files; team photographs; a second client testimonial; images for Capitol Hill, Black Salon, JT20 / Santhal Strikers and Shambhavi Shiva.

00a. No team photographs, campaign creatives, website screenshots or identity boards were available in the supplied folder, so About and most case studies are typographic. Nothing was invented; add files to `assets/media/<slug>/` and register them in `content/media.json`.
00b. Social links: none exist in the supplied material, so none are shown.
00c. Only two projects (Majestic India, Navdurga) have approved visuals; the other 22 use ruled typographic listings and typographic case-study heroes.

0a. Media for Capitol Hill, Black Salon, JT20 and Shambhavi: files over 10 MB could not be fetched, so these use typographic posters. See `asset-manifest.md`.
0b. Navdurga file mapping is now verified from on-screen content; the earlier "film 1 / film 2" labels were replaced.
0c. Hindi quote falls back to a system Devanagari font (the chosen fonts have no Devanagari). Self-hosting Noto Serif Devanagari would make it consistent.

1. WhatsApp action omitted until the number is confirmed as the right WhatsApp contact.
2. Delivery status unclear in the source → shown as "Status to confirm": The Pi, Dimechain, QuZones, i-Fit.Me, Unfaked.
3. Which Navdurga file is which film (see asset manifest).
4. Eight Drive videos and the Graphics images need project mapping.
5. Moksh/Dhanbad: shown "Delivered" because logos, guidelines and Sparrow’s menu are developed; the property itself is upcoming.
6. Capitol Hill and others have no approved imagery; cards use geometry.
7. Org structured data uses only name, URL, email, phone. No address, social URLs or ratings were invented.
8. Contact form needs `RESEND_API_KEY`, `CONTACT_FROM` (a Resend-verified sender) and `CONTACT_TO` in Vercel. Until then it returns an honest "not switched on" message with direct contact details.
9. Captions for speech in videos have not been produced.
10. Lighthouse was not run in this environment, so the 90/85 score targets are unverified.
