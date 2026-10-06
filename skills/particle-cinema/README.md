# Particle Cinema

[简体中文](README.zh-CN.md)

Cinematic particles rendered in Three.js / GLSL: galaxies, braided flow, helices, text/logo assembly,
radial shockwaves, warp tunnels and energy spheres. Includes a local preview with playback/seeking,
21-second worked example, bloom, analytic trails, deterministic morphs and MP4 export.

![Seven-shot example](docs/nova-sheet.jpg)

Install with Claude Code:

```text
/plugin marketplace add goforai-vip/opus-video-skills
/plugin install particle-cinema@opus-video-skills
```

For Codex, copy this `particle-cinema` directory into your personal `~/.codex/skills` directory.
Start with: “Make a cinematic particle video: a galaxy converges into my logo, explodes into light and flies through a star tunnel.”

To run the template directly:

```bash
node skills/particle-cinema/scripts/new_project.mjs my-particles
cd my-particles
npm ci
npm run preview
npm run sheet
npm run clip
```

Requires Node.js 20.19+ or 22.12+, Chrome/Chromium and ffmpeg. No API key, image generation service or CDN.
Default output: 1920×1080, 30 fps, silent. `draft` / `standard` / `ultra` use 16K / 60K / 140K particles plus trail copies;
hardware performance varies. Local transparent PNG/SVG logo masks and installed fonts are supported.
See [SKILL.md](SKILL.md) for adaptation and review instructions.

MIT, under the repository [LICENSE](../../LICENSE).
