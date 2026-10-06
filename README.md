<div align="center">

# opus-video-skills

<a href="README.md"><img src="https://img.shields.io/badge/English-0E0F0E?style=for-the-badge" alt="English"></a>
<a href="README.zh-CN.md"><img src="https://img.shields.io/badge/简体中文-DDF53D?style=for-the-badge" alt="简体中文"></a>

A collection of video-making skills: hand-painted animation, kinetic typography and cinematic GPU particles.

</div>

## GoForAI fork

Maintained at [goforai-vip/opus-video-skills](https://github.com/goforai-vip/opus-video-skills), forked from [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills). This fork adds **particle-cinema**: a GPU particle engine with seven effects, logo/text morphs, bloom, analytic trails, a local preview player and a 21-second runnable example. The new skill works with Codex and Claude Code; the original two skills retain their upstream workflows.

## Overview

Each skill guides a coding agent through storyboarding, animation, frame review and final encoding. Visuals are generated procedurally in code; music workflows vary by style, and particle-cinema is silent unless a local audio track is supplied. Every frame is a pure function of time, rendered in headless Chrome and encoded with ffmpeg.

## Styles

| Skill | Style | Typical use |
|---|---|---|
| [painted-animation](skills/painted-animation/) | Hand-painted watercolour and ink cartoon, with character acting | Animated shorts, music videos, lyric videos with karaoke |
| [particle-cinema](skills/particle-cinema/) | Cinematic GPU particles with glow, trails and continuous morphs | Brand reveals, sci-fi intros, music visuals |
| [kinetic-reel](skills/kinetic-reel/) | Kinetic typography: condensed display type, HUD micro-type, WebGL layers | Portfolio and work reels, showreels, product and intro films |

### painted-animation

![painted-animation](skills/painted-animation/docs/xiaozhen-sheet.jpg)

Draws every shot with p5.js and the p5.brush watercolour library. Characters act through a library of expressions and motion principles. Music videos are cut to the measured beat, and lyric videos carry word-by-word karaoke subtitles. Example: a 31-second lyric video for 陶喆《小镇姑娘》. [Documentation](skills/painted-animation/README.md).

### kinetic-reel

![kinetic-reel](skills/kinetic-reel/docs/work-reel-sheet.jpg)

Combines a 2D type canvas with three.js layers (particle terrain, liquid marble, a chrome knot, a particle cloud that condenses into a shape) and a WebGL post pass. Shots are joined by shape-continuity transitions, and the score is synthesized from the same timeline as the picture. Example: "Work Reel ’26", an 84-second portfolio reel. [Documentation](skills/kinetic-reel/README.md).

### particle-cinema

![Particle Cinema](skills/particle-cinema/docs/nova-sheet.jpg)

Galaxies, braided currents, helices, particle text/logo reveals, radial shockwaves, warp tunnels and energy spheres. Three.js / GLSL, deterministic frame rendering, no generation API. [Documentation](skills/particle-cinema/README.md).

## Requirements

- Claude Code with Claude Opus 5.5 for the original skills; Codex or Claude Code for particle-cinema
- Node.js 20.19+ or 22.12+ for particle-cinema
- Node.js, Google Chrome, ffmpeg
- Python 3 with numpy (painted-animation tempo detection only)

## Installation

**As plugins (recommended).** In Claude Code:

```
/plugin marketplace add goforai-vip/opus-video-skills
/plugin install painted-animation@opus-video-skills
/plugin install kinetic-reel@opus-video-skills
/plugin install particle-cinema@opus-video-skills
```

Install the skills you need. `/plugin update` fetches new versions.

**As personal skills.** Clone the repository once and link the skills you want:

```bash
git clone https://github.com/goforai-vip/opus-video-skills ~/opus-video-skills
ln -s ~/opus-video-skills/skills/painted-animation ~/.claude/skills/painted-animation
ln -s ~/opus-video-skills/skills/kinetic-reel ~/.claude/skills/kinetic-reel
ln -s ~/opus-video-skills/skills/particle-cinema ~/.claude/skills/particle-cinema
```

Updating is then a `git pull` in `~/opus-video-skills`.

> **Upgrading from `painted-animation`.** This repository was previously the single `painted-animation` skill, cloned directly into `~/.claude/skills/painted-animation`. That layout no longer works, because the skill now lives in `skills/painted-animation/`. Remove the old clone and install with either method above.

For Codex, copy `skills/particle-cinema` into your personal `~/.codex/skills` directory (on Windows, `%USERPROFILE%\.codex\skills`).

## Usage

Describe the video in Claude Code. The matching skill is selected automatically, or it can be invoked by name:

> Make a 15-second video of Clawd trying to catch a butterfly.

> Make a 60-second kinetic-type reel of my three projects from this résumé.

Each skill scaffolds a project, presents a storyboard, builds and reviews every shot, and writes the finished MP4 to the project's `out/` directory.

Try the new style: “Make a cinematic particle animation: a galaxy gathers into my logo, bursts into light and flies through a star tunnel.”

## Repository Structure

| Path | Description |
|---|---|
| `.claude-plugin/marketplace.json` | Plugin marketplace manifest (one plugin per skill) |
| `skills/painted-animation/` | Watercolour animation skill: engine, guides, examples |
| `skills/particle-cinema/` | GPU particle skill, local preview, engine, scaffolder and worked example |
| `skills/kinetic-reel/` | Kinetic-typography reel skill: engine, guides, examples |

## Adding a Style

A new style is a new directory under `skills/` containing a `SKILL.md`, a runnable `template/` and at least one worked example, plus an entry in `.claude-plugin/marketplace.json`. The skills share a contract: frames are pure functions of time, `render.mjs` produces contact sheets and parallel frame renders, and every shot is reviewed from rendered images before the final encode.

## Acknowledgements

The painted-animation engine and guide are adapted from [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) by John Heibel (MIT License), and the method follows his [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo). The kinetic-reel renderer is derived from the same kit. The upstream skills and examples were produced with Claude Opus 5.5 in Claude Code. This fork adds an independent particle engine and renderer. The projects use p5.js, p5.brush, three.js, Puppeteer and ffmpeg.

## License

MIT. See [LICENSE](LICENSE).
