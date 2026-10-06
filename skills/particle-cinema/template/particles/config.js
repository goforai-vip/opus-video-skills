// Change the story here. Presets: galaxy, vortex, helix, text, burst, warp, orb.
// Every cue describes the end state; its first `transition` seconds morph from the preceding cue.
window.PARTICLE_PROJECT = {
  width: 1920, height: 1080, fps: 30, duration: 21, bpm: 120,
  seed: 2005, quality: 'standard', // draft: 16000, standard: 60000, ultra: 140000
  text: 'NOVA', font: '900 180px Arial',
  logo: '', // Optional local transparent PNG / self-contained SVG, e.g. ../assets/logo.png
  maskMode: 'alpha', // For a white mark on opaque black use 'luminance'.
  audio: '', // Optional local audio file, e.g. assets/score.m4a
  palette: ['#51e8ff', '#7664ff', '#ff83c9'],
  bloom: 0.85, exposure: 1.05, pointSize: 1.65,
  trails: 3, hud: true,
  cues: [
    { at: 0,  preset: 'galaxy', label: 'COSMIC ORIGIN', transition: 0 },
    { at: 3,  preset: 'vortex', label: 'INTO THE CURRENT', transition: 1.1 },
    { at: 6,  preset: 'helix',  label: 'ORDER FROM CHAOS', transition: 1.1 },
    { at: 9,  preset: 'text',   label: 'TAKE SHAPE', transition: 1.3 },
    { at: 12, preset: 'burst',  label: 'RELEASE THE ENERGY', transition: 0.65 },
    { at: 15, preset: 'warp',   label: 'BEYOND THE HORIZON', transition: 0.9 },
    { at: 18, preset: 'orb',    label: 'A NEW WORLD', transition: 1.2 }
  ]
};
