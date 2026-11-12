# Making posters and videos from the client's files

Download the originals from the shared Drive folder locally, then:

```bash
# optimised, self-hosted video (720w H.264, fast start)
ffmpeg -i source.mp4 -c:v libx264 -preset slow -crf 27 -vf scale=720:-2 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k assets/media/<slug>/<name>.mp4

# a poster frame at 12.5 seconds (check the frame is clean: no end cards or contact details)
ffmpeg -ss 12.5 -i source.mp4 -frames:v 1 -q:v 2 poster.png
# then export <name>-420.{jpg,webp} and <name>-720.{jpg,webp}
```

Then register it in `content/media.json` (poster path, alt text, focal point, gallery) and, for self-hosted video, in `LOCAL_VIDEOS` in `content/site.mjs`. Run `node scripts/build.mjs`. The build fails if a referenced file is missing.
