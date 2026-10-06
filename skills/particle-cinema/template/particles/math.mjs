export const PRESETS = Object.freeze({ galaxy: 0, vortex: 1, helix: 2, text: 3, burst: 4, warp: 5, orb: 6 });
export const TIERS = Object.freeze({ draft: 16000, standard: 60000, ultra: 140000 });
export const clamp = x => Math.max(0, Math.min(1, x));
export const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };

export function random(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let v = Math.imul(state ^ state >>> 15, 1 | state);
    v ^= v + Math.imul(v ^ v >>> 7, 61 | v);
    return ((v ^ v >>> 14) >>> 0) / 4294967296;
  };
}

export function validateConfig(p) {
  for (const k of ['width', 'height', 'fps', 'duration', 'bpm'])
    if (!Number.isFinite(p[k]) || p[k] <= 0) throw new Error(`${k} must be positive`);
  if (!Number.isInteger(p.width) || !Number.isInteger(p.height) || p.width % 2 || p.height % 2)
    throw new Error('width and height must be even integers for H.264');
  if (!Object.hasOwn(TIERS, p.quality)) throw new Error('quality must be draft, standard or ultra');
  if (!Number.isInteger(p.seed)) throw new Error('seed must be an integer');
  if (!Number.isInteger(p.trails) || p.trails < 0 || p.trails > 4) throw new Error('trails must be an integer from 0 to 4');
  if (!['alpha', 'luminance'].includes(p.maskMode)) throw new Error('maskMode must be alpha or luminance');
  for (const k of ['bloom', 'exposure', 'pointSize'])
    if (!Number.isFinite(p[k]) || p[k] < 0) throw new Error(`${k} must be non-negative`);
  if (!Array.isArray(p.palette) || p.palette.length !== 3 || p.palette.some(c => !/^#[0-9a-f]{6}$/i.test(c)))
    throw new Error('palette must contain three #RRGGBB colors');
  if (!Array.isArray(p.cues) || !p.cues.length || p.cues[0].at !== 0) throw new Error('cues must start at zero');
  p.cues.forEach((c, i) => {
    if (!Object.hasOwn(PRESETS, c.preset)) throw new Error(`unknown preset: ${c.preset}`);
    if (!Number.isFinite(c.at) || c.at < 0 || c.at >= p.duration || i && c.at <= p.cues[i - 1].at)
      throw new Error('cue times must increase within duration');
    const end = p.cues[i + 1]?.at ?? p.duration;
    if (!Number.isFinite(c.transition) || c.transition < 0 || c.transition > end - c.at)
      throw new Error('transition must fit inside its cue');
  });
  return p;
}

// No accumulated state: seeking backwards gives exactly the same transition.
export function cueAt(t, cues) {
  let i = 0;
  while (i + 1 < cues.length && t >= cues[i + 1].at) i++;
  const cue = cues[i], from = cues[Math.max(0, i - 1)];
  return { index: i, cue, from, blend: cue.transition > 0 ? smooth((t - cue.at) / cue.transition) : 1 };
}

// Sample the actual glyph/logo pixels, with a fixed seed, then upload once.
export function sampleMask(pixels, w, h, count, seed, mode = 'alpha') {
  const hits = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const k = (y * w + x) * 4;
    const coverage = mode === 'luminance'
      ? pixels[k + 3] * (pixels[k] + pixels[k + 1] + pixels[k + 2]) / (3 * 255) : pixels[k + 3];
    if (coverage > 96) hits.push([x, y]);
  }
  if (!hits.length) throw new Error('The text/logo mask is empty; check font, transparency and maskMode');
  const rng = random(seed), target = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x, y] = hits[Math.floor(rng() * hits.length)];
    target[i * 3] = (x + rng() * 2 - w / 2) / w * 16;
    target[i * 3 + 1] = -(y + rng() * 2 - h / 2) / w * 16;
    target[i * 3 + 2] = (rng() - 0.5) * 0.32;
  }
  return target;
}
