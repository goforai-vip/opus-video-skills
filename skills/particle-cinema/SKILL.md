---
name: particle-cinema
description: Create cinematic GPU particle animations and MP4s in code using Three.js and GLSL. Use for spectacular particle effects, galaxy or nebula reveals, flow fields, energy explosions, hyperspace tunnels, and particles assembling into text or a supplied logo. Supports deterministic morphs, bloom, analytic trails, camera choreography and offline frame rendering. Suitable for Chinese requests such as 炫酷粒子动画、粒子聚合、粒子文字、星云、能量爆散. Use painted-animation for watercolour cartoons and kinetic-reel for typography-led editorial reels.
---

# Particle cinema

Make the particles carry the scene: a recognisable silhouette, an intentional transformation and a clean landing.
The bundled `template/` renders a 21-second, seven-shot example entirely on the GPU, without generation APIs.
It works with coding agents including Codex and Claude Code; no particular language model is required.

## Start a project

Run the bundled scaffolder from the installed skill directory (resolve that directory in the current environment):

```bash
node scripts/new_project.mjs <project-dir>
cd <project-dir>
npm ci
npm run preview
```

The destination must be empty. Node.js 20.19+ or 22.12+, Chrome/Chromium and ffmpeg are the toolchain.
Open the printed local URL. The project loads Three.js and postprocessing locally from `node_modules`;
it has no CDN or API-key dependency. Use `CHROME_PATH` / `--chrome=<path>` if Chrome is not detected.

Read [references/effects.md](references/effects.md) when selecting effects or building custom ones.
For a concrete timeline, read [examples/nova/STORYBOARD.md](examples/nova/STORYBOARD.md).

## Design and implement

Write the sequence into `STORYBOARD.md`: subject/mark, palette, format, timed shots, camera path,
what the viewer should understand, and each transition. Resolve only missing decisions that materially
change the result; respect any instruction to proceed directly.

Edit `particles/config.js` to choose the duration, exact width/height, palette, seed, density, bloom and cues.
The seven presets are `galaxy`, `vortex`, `helix`, `text`, `burst`, `warp` and `orb`.
Each cue's first `transition` seconds morph from the previous cue. Keep enough hold time to read a mark.
For a logo, use a local transparent PNG or self-contained SVG and set `logo`; use `maskMode: 'luminance'`
for a white mark on black. Text uses the configured installed font; confirm the intended glyphs exist.
Only the title/mark is sampled: all movement and lighting remain procedural.

For new effects, extend `PRESETS` in `particles/math.mjs` and `field()` in `particles/engine.js`.
Keep GPU attributes stable and calculate positions from seed, cue-local time and absolute time.
Avoid accumulated velocities, frame-to-frame feedback and unseeded randomness: workers seek in any order.
The flow preset is an analytic braided field, not a curl-noise fluid simulation. Use that distinction when explaining it.

## Review real frames and movement

```bash
npm test
npm run sheet
node render.mjs --sheet=8.98,9,9.35,9.7,10.3,11.8 --cols=3 --out=out/check/morph.jpg
node render.mjs --stills=10.5 --out=out/detail
node render.mjs --clip --range=8.5:12.7 --out=out/check/morph.mp4
```

Inspect the images and play the transition clip when playback is available. Check the silhouette and letter
spacing, dark negative space, depth, clipped glow, particles vanishing at cuts, camera direction and the landing.
Bloom must leave visible particle cores; do not fill the frame with white. A before/after comparison should
use the same time and seed. A static contact sheet alone does not prove smooth motion.

Use `draft` for iteration, `standard` for the normal final and `ultra` only when the GPU/time budget permits.
These are 16,000 / 60,000 / 140,000 particles before trail copies, not performance promises.
Render time includes readback and encoding; report actual export measurements if requested.
Use `--quality=draft` or `--soft-gl` for an explicit fallback, and state which quality was exported.

## Export

```bash
node render.mjs --clip --out=out/particles.mp4
# Longer jobs, resumable within an unchanged project:
node render.mjs --frames --workers=2 --frames-dir=out/final-frames
node render.mjs --encode --frames-dir=out/final-frames --out=out/particles.mp4
```

The default export is 30 fps. Pass the same `--fps` to frames and encode if changing it.
Change `--frames-dir` after editing the scene, resolution, quality or fps; old frames are not automatically invalidated.
Use `--range=start:end` with `--clip` for a segment. `--audio=assets/music.m4a` muxes user-supplied music;
the default demo is silent. Do not claim beat/audio reactivity from the unused `bpm` setting: cue timing must
be aligned explicitly, and a real amplitude/spectrum feature needs analysis beyond this template.
Confirm the exported file's codec, resolution and duration with ffprobe, then provide its path/link.
Keep the source project so the user can request another mark, colour, camera move or format.
