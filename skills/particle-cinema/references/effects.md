# Effect design and engine map

## Visual vocabulary

| Preset | Geometry and motion | Useful role |
|---|---|---|
| galaxy | Five spiral arms, tilted dust disk, slow orbit | Vast establishing shot; origin story |
| vortex | Seven braided tubes carried along a helical field | Accelerating transition; gathering energy |
| helix | Double helix and connecting rungs | Order, assembly, science |
| text | Seeded samples from actual glyph/mark pixels | Brand reveal; destination silhouette |
| burst | Radial shell plus expanding equatorial shock ring | Release, impact, launch |
| warp | Radial tunnel with wrapped depth and analytic trails | Camera travel; passage into a new scene |
| orb | Rippling spherical shell with orbiting phase | Energy core; finale |

The default sequence spends three seconds on each effect. `transition` occupies the beginning of a cue;
the rest holds its target. For a less generic result pick a visual story and use only its necessary effects.
For example, brand launch: distant galaxy → converging current → clean mark → impact ring → mark again.
The fixed demo text `NOVA` is placeholder branding, not a claim about the user's company.

## Keep the particle detail

- Use one cool base, one deeper secondary and a smaller hot accent. Preserve black around the silhouette.
- Start with bloom 0.6–0.9, then inspect a full-resolution close-up. Reduce opacity/pointSize before increasing glow.
- The `text` mode reduces particle opacity to keep dense glyphs from turning into solid white rectangles.
- Draft quality uses at most one trail copy. Standard and ultra use the configured number, from zero to four.
- Trails evaluate `field(t - lag)` in the same frame. They have no feedback buffer or warmup.
- Morph arcs vanish at both ends. A morph longer than a shot obscures both shapes; config validation rejects it.

## Custom shader effects

`aSeed` is a fixed vec4 per particle. `aTarget` is its text/logo destination. `uTime` is absolute time,
`uLocal` is time since the current cue, `uFrom/uTo` choose the fields, and `uMorph` is smoothstep progress.
Position transforms, twinkle and camera paths all use explicit time. GPU points are rendered with additive
blending into an HDR compositor followed by UnrealBloomPass and OutputPass (ACES filmic output).
The final Canvas 2D draws restrained labels and a vignette after the WebGL pass.

For custom noise, make its function deterministic. A domain-warped field can be analytic; actual simulated
physics needs deterministic checkpoints or precomputed trajectories before arbitrary-time export works.
Do not describe the built-in braid as a validated fluid/curl solver.

If a particle path wraps (the warp preset's depth does), keep its trail copies short enough that wrapping
does not draw a full-screen line. There is no promise that the default sequence loops seamlessly.

## Marks, formats and music

`logo` is relative to `particles/index.html`: `../assets/logo.png`. Transparent silhouettes use alpha;
opaque black/white masks use luminance. Empty masks fail with an explicit error. Use self-contained SVGs
with paths rather than external resources; complex filters and external fonts may rasterize differently.
Text uses browser-installed fonts. Embed a licensed local font and await `document.fonts` for consistent
glyphs across machines. CJK support depends on the selected font.

For vertical output set 1080×1920, disable `hud` if necessary and inspect every crop. The text camera backs
up to fit the target horizontally; custom fields may need more distance in portrait layouts.
Keep width and height even for H.264. `config.fps` expresses the intended timing; the export CLI's `--fps`
controls frame sampling and must be supplied consistently.

To align music, obtain the local track, measure its beat grid, place cue times on chosen beats and hold
the mark between hits. Mux with `--audio`. The engine does not currently compute FFT/audio amplitude.

## Files and diagnostics

| File | Responsibility |
|---|---|
| `particles/config.js` | Shot cues, brand, palette, quality and output size |
| `particles/math.mjs` | Preset IDs, PRNG, configuration and mask sampling |
| `particles/engine.js` | GPU fields, glow, morphing, camera and render contract |
| `particles/index.html` | Preview player with seek/pause |
| `render.mjs` | Chrome, screenshots, frame workers, ffmpeg |
| `serve.mjs` | Local static server, bound to 127.0.0.1 |

GPU creation / shader errors surface in the page and stop export. A missing Chrome needs `--chrome` or
`CHROME_PATH`; ffmpeg needs PATH or `--ffmpeg` / `FFMPEG_PATH`. Try `--soft-gl` if hardware WebGL is unavailable,
expecting a slower export. Do not silently drop to a different visual technique.
