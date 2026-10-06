# Worked example: Work Reel ’26 (v3.1, 84 s)

A complete portfolio-reel example, in three chapters
(Microsoft Cloud & AI → UW–Madison Department of Surgery → Enterprise RAG) and a trace finale. The files show
the complete scene and timing structure:

- `reel.js`: all scenes (intro, index, 10 Microsoft shots, 5 Surgery shots, 5 RAG shots, trace, end), the
  transition map `TR` and `SCENES`. It imports three.js from `../../site/vendor/three/three.module.js`. When you
  copy it into a scaffolded project, change that import to `../node_modules/three/build/three.module.js`.
- `cues.js`: the 84 s timeline (`S`, `hits`, `CH`).
- `score.mjs`: the score. It requires `../kinetic/cues.js`; point it at `../reel/cues.js`.
- `STORYBOARD.md`: the v3 structure and v1's original storyboard.

Read it for how to pace a long reel and budget chapter emphasis. It also shows the trace finale,
`cloud.project()` wiring 2D retrieval lines to 3D points, RRF computed for real in `FUSED`, and the choice of
transition inside each chapter.

Names and contact details are placeholders. The project descriptions and figures are example content, not claims about the user; replace them with independently sourced material before publishing.
