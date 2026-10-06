import test from 'node:test';
import assert from 'node:assert/strict';
import { random, cueAt, sampleMask, validateConfig } from '../particles/math.mjs';
const cues=[{at:0,preset:'galaxy',transition:0},{at:3,preset:'text',transition:1},{at:6,preset:'burst',transition:.5}];
const config=()=>({width:1920,height:1080,fps:30,duration:9,bpm:120,seed:42,quality:'draft',trails:1,maskMode:'alpha',bloom:.8,exposure:1,pointSize:2,palette:['#112233','#445566','#778899'],cues});
test('arbitrary seeks preserve morph endpoints and continuity at cuts',()=>{
  const first=cueAt(3.5,cues);cueAt(7,cues);assert.deepEqual(cueAt(3.5,cues),first);
  assert.equal(cueAt(3,cues).blend,0);assert.equal(cueAt(4,cues).blend,1);
  assert.equal(cueAt(3-1e-6,cues).cue.preset,cueAt(3,cues).from.preset);
});
test('seeded particles repeat and distinct seeds change the field',()=>{
  const values=seed=>{const r=random(seed);return Array.from({length:100},()=>r());};
  assert.deepEqual(values(42),values(42));assert.notDeepEqual(values(42),values(43));
  assert.ok(values(42).every(x=>x>=0&&x<1));
});
test('mask preserves transparent background and luminance mode rejects black',()=>{
  const rgba=new Uint8ClampedArray(4*4*4);rgba.set([255,255,255,255],0);rgba.set([0,0,0,255],8);
  const a=sampleMask(rgba,4,4,80,42,'luminance');assert.equal(a.length,240);
  assert.deepEqual(a,sampleMask(rgba,4,4,80,42,'luminance'));
  assert.ok([...a].every(Number.isFinite));
  for(let i=0;i<80;i++)assert.ok(a[i*3]<0); // only the white pixel on the left is sampled
  assert.throws(()=>sampleMask(new Uint8ClampedArray(64),4,4,1,42),/empty/);
});
test('invalid cue, quality, dimensions and transition fail before rendering',()=>{
  assert.equal(validateConfig(config()).duration,9);
  assert.throws(()=>validateConfig({...config(),width:1919}),/even/);
  assert.throws(()=>validateConfig({...config(),quality:'bogus'}),/quality/);
  assert.throws(()=>validateConfig({...config(),cues:[{at:0,preset:'bogus',transition:0}]}),/unknown/);
  assert.throws(()=>validateConfig({...config(),cues:[{at:0,preset:'galaxy',transition:10}]}),/transition/);
});
