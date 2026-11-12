# Asset manifest (Drive folder "PREVIOUS WORKS")

**How media was obtained.** Drive downloads are blocked from the build environment, and the Drive connector only returns files up to 10 MB. Only files under that limit could be processed. Every file below was checked by viewing extracted frames before being assigned to a project.

## Used (self-hosted, optimised)
| Source file | Verified as | Hosted as | Used on |
|---|---|---|---|
| Majestic India logo reveal .mp4 | Majestic India reveal: performance with red paper, matches the project brief | `assets/media/majestic-india/logo-reveal.mp4` + 3 stills (WebP/JPG, 420/720w) | Majestic India (hero uses the portrait still; red-paper and walking stills in the gallery), Tangent Media, homepage card, hero reel |
| Nav durga.mp4 | Navdurga airport-to-site journey: on-screen captions "Air freight, within reach", "Haldia Port", Nav Durga gate | `assets/media/navdurga/airport-to-site.mp4` | Navdurga, Tangent Media, hero reel |
| navdurga2.mp4 | Navdurga FPV-style facilities walkthrough: cranes, aerial, roads, trucks, no captions | `assets/media/navdurga/fpv-walkthrough.mp4` + stills | Navdurga (hero + gallery), Tangent Media, hero reel |

Both Navdurga films end on a "Coming soon" card that includes a third-party phone number. This is part of the client's film. Stills and the hero reel avoid it.

## Posters and alt text
Poster frames are generated per file at 420w and 720w in WebP and JPG, with alt text in `content/media.json`. The hero reel (`assets/media/home/hero-reel.mp4`, 10 s, muted, ~0.8 MB) is cut from the three films above, with a collage fallback poster.

## Still playing from Drive on request (no poster possible)
Over the 10 MB limit, so no verified frames could be extracted: SANTHAL STRIKERS _1.mp4, SUNDOWNER ZOI FINAL CUT.mp4, zoha full n final.mp4, dense 19 sept.mp4, Coronation ceremony.mp4. They open in an accessible dialog only after the visitor presses play. The projects they belong to use a typographic poster.

## Needs confirmation (unused)
- BTS 4 V2.mp4 — withheld: Saregama BTS is unpublished and under management review.
- DANDIYA 2026_1.mp4, 001.mp4, Video 1.mp4, VOF.mov, SOR_2.mp4, Soon (1).mp4, Birthday ruin house.mp4, vandamaniyaa_1.mp4 — client/project unknown.
- Graphics/ — 4 JPGs of a tribal-look saree shoot ("Nayna", Padiya saree, Jharkhand). No on-image link to any project, so unused. Confirm the client and credit.

## Projects without approved media (typographic poster)
Capitol Hill, Black Salon, JT20 / Santhal Strikers and Shambhavi Shiva are featured projects with no obtainable approved frames. Their posters use each project's verified headline figure and its qualifying label. To replace them: drop a poster set at `assets/media/<slug>/` and add the project to `content/media.json`; `scripts/make-media.md` shows the ffmpeg commands.

## Still to do for production
- Host the remaining videos (needs files from the client's Drive, or a Drive API token).
- Captions/transcripts for speech-led films. Each video currently has a visible title and a source-grounded summary instead.
