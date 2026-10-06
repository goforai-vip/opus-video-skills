import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PRESETS, TIERS, random, validateConfig, cueAt } from './math.mjs';
import { sampleMask } from './math.mjs';

const vertexShader = `
  uniform float uTime, uLocal, uFromLocal, uMorph, uLag, uSize, uHeight, uOpacity;
  uniform int uFrom, uTo;
  attribute vec4 aSeed;
  attribute vec3 aTarget;
  varying float vAlpha, vTint, vSpark;
  const float TAU = 6.28318530718;
  mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
  vec3 field(int mode, float t, float local) {
    float r, a, y; vec3 p;
    if (mode == 0) { // Five spiral arms, with a dust disk and a bright inner bulge.
      r = pow(aSeed.x, 0.65) * 8.3;
      a = floor(aSeed.y * 5.) / 5. * TAU + r * 0.56 + (aSeed.z - .5) * (.35 + r * .09) + t * .12;
      p = vec3(cos(a)*r, (aSeed.w-.5)*(.16+r*.1), sin(a)*r*.65);
      p.yz = rot(.42) * p.yz;
    } else if (mode == 1) { // Analytic braided flow tubes; arbitrary seeks need no simulation warmup.
      float s = aSeed.x*TAU*3. + t*.55;
      float braid = floor(aSeed.y*7.)/7.*TAU;
      r = 2.6 + .8*sin(s*2. + braid);
      p = vec3(cos(s)*r + .65*cos(braid+s*4.), sin(s)*r*.7 + .65*sin(braid+s*4.), (aSeed.x-.5)*11.);
      p += (aSeed.z-.5)*vec3(.22,.22,.22);
      p.xz = rot(.45) * p.xz;
    } else if (mode == 2) { // Double helix with connecting rungs.
      y = (aSeed.x-.5)*9.; a = y*1.5 + floor(aSeed.y*2.)*3.14159 + t*.7;
      r = aSeed.z < .15 ? aSeed.w*2.5 : 2.5+(aSeed.w-.5)*.16;
      p = vec3(cos(a)*r, y, sin(a)*r);
      p.xy = rot(.65) * p.xy;
    } else if (mode == 3) {
      p = aTarget;
      p.z += sin(p.x*.7 + t*1.7)*.08;
    } else if (mode == 4) { // Radial blast; expansion is tied to the current cue, not frame history.
      float age = max(0., local-uLag);
      a = aSeed.y*TAU; float z = aSeed.x*2.-1.;
      r = (.8 + pow(aSeed.z,.7)*6.) * (1.-exp(-age*1.35));
      float ring = step(.86,aSeed.w);
      p = mix(vec3(sqrt(max(0.,1.-z*z))*cos(a), z, sqrt(max(0.,1.-z*z))*sin(a))*r,
              vec3(cos(a),sin(a),0.)*(1.5+age*2.4), ring);
    } else if (mode == 5) {
      a = aSeed.y*TAU; r = .65+pow(aSeed.x,.5)*7.8;
      p = vec3(cos(a)*r,sin(a)*r,mod(aSeed.z*40.+t*10.,40.)-25.);
    } else {
      float z = aSeed.x*2.-1.; a = aSeed.y*TAU + t*.22;
      r = 3.4 + .18*sin(a*9.+t*1.8) + .22*cos(z*14.-t*1.3);
      p = vec3(sqrt(max(0.,1.-z*z))*cos(a),z,sqrt(max(0.,1.-z*z))*sin(a))*r;
      p.xz = rot(.3*sin(t*.2)) * p.xz;
    }
    return p;
  }
  void main() {
    float t = uTime-uLag;
    vec3 p = mix(field(uFrom,t,uFromLocal),field(uTo,t,uLocal),uMorph);
    // The arc vanishes at both endpoints, preserving the readable destination silhouette.
    p += sin(uMorph*3.14159265)*vec3(sin(aSeed.x*TAU+t),cos(aSeed.y*TAU+t),sin(aSeed.z*TAU))*1.4;
    vec4 mv = modelViewMatrix * vec4(p,1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize*(.65+aSeed.w*1.9)*uHeight/max(1.,-mv.z)*.035,1.,22.);
    float textMix = mix(uFrom == 3 ? 1. : 0., uTo == 3 ? 1. : 0., uMorph);
    vAlpha = uOpacity * mix(1.,.34,textMix) * smoothstep(.5,2.,-mv.z) * (.4+.6*aSeed.z);
    vTint = aSeed.y*.7 + .3*sin(aSeed.x*5.+t*.15);
    vSpark = .65 + .35*pow(.5+.5*sin(t*2.+aSeed.w*90.),6.);
  }
`;
const fragmentShader = `
  uniform vec3 uColorA, uColorB, uColorC;
  varying float vAlpha, vTint, vSpark;
  void main() {
    float d = length(gl_PointCoord-.5)*2.;
    if (d>1.) discard;
    float halo = exp(-d*d*6.5)*.36;
    float core = exp(-d*d*65.);
    vec3 color = mix(uColorA,uColorB,smoothstep(0.,.65,vTint));
    color = mix(color,uColorC,smoothstep(.6,1.,vTint));
    color = mix(color,vec3(1.),core*.4);
    gl_FragColor = vec4(color * (1.+core*1.4), (halo+core*.75)*vAlpha*vSpark);
  }
`;

async function targetPoints(p, count) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (p.logo) {
    const img = new Image(); img.src = p.logo;
    await img.decode();
    const scale = Math.min(900/img.width,400/img.height);
    ctx.drawImage(img,(1024-img.width*scale)/2,(512-img.height*scale)/2,img.width*scale,img.height*scale);
  } else {
    await document.fonts.load(p.font, p.text); await document.fonts.ready;
    ctx.font = p.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
    ctx.fillText(p.text,512,256,900);
  }
  return sampleMask(ctx.getImageData(0,0,1024,512).data,1024,512,count,p.seed+1,p.maskMode);
}

export async function start() {
  const p = validateConfig(window.PARTICLE_PROJECT), W = p.width, H = p.height;
  const tier = new URLSearchParams(location.search).get('quality') || p.quality;
  if (!Object.hasOwn(TIERS,tier)) throw new Error(`Unknown quality: ${tier}`);
  const count = TIERS[tier], rng = random(p.seed), seeds = new Float32Array(count*4);
  for (let i=0;i<seeds.length;i++) seeds[i]=rng();
  const target = await targetPoints(p,count);
  const output = document.getElementById('out'); output.width=W; output.height=H;
  const ctx = output.getContext('2d'), glCanvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({canvas:glCanvas,antialias:false,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1); renderer.setSize(W,H,false); renderer.setClearColor(0x02040b);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=p.exposure;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(48,W/H,.1,100);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));
  geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,4));
  geometry.setAttribute('aTarget',new THREE.BufferAttribute(target,3));
  const materials=[];
  const trailCount = tier==='draft' ? Math.min(1,p.trails) : p.trails;
  for (let i=0;i<=trailCount;i++) {
    const material = new THREE.ShaderMaterial({vertexShader,fragmentShader,
      transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
      uniforms:{uTime:{value:0},uLocal:{value:0},uFromLocal:{value:0},uMorph:{value:0},uFrom:{value:0},uTo:{value:0},
        uLag:{value:i*.045},uSize:{value:p.pointSize*(i?1.1:1)},uHeight:{value:H},uOpacity:{value:(i?.12:1)*Math.sqrt(60000/count)},
        uColorA:{value:new THREE.Color(p.palette[0])},uColorB:{value:new THREE.Color(p.palette[1])},uColorC:{value:new THREE.Color(p.palette[2])}}
    });
    const points=new THREE.Points(geometry,material); points.frustumCulled=false;
    scene.add(points); materials.push(material);
  }
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(W,H),p.bloom,.65,.28);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  const cameraPose = (preset,t) => {
    const z = preset==='text' ? Math.max(14,16*H/W) : preset==='warp' ? 9 : 15.8;
    return new THREE.Vector3(preset==='text'?0:Math.sin(t*.18)*.75,preset==='text'?0:Math.cos(t*.13)*.45,z);
  };
  function frame(t) {
    // Explicit time; composer receives a constant delta and no pass has frame history.
    const state=cueAt(t,p.cues), {cue,from,blend}=state;
    for (const m of materials) {
      const u=m.uniforms; u.uTime.value=t; u.uLocal.value=t-cue.at; u.uFromLocal.value=t-from.at;
      u.uFrom.value=PRESETS[from.preset]; u.uTo.value=PRESETS[cue.preset]; u.uMorph.value=blend;
    }
    camera.position.copy(cameraPose(from.preset,t)).lerp(cameraPose(cue.preset,t),blend); camera.lookAt(0,0,0);
    composer.render(0); ctx.clearRect(0,0,W,H); ctx.drawImage(glCanvas,0,0);
    // Restrained, separate typography leaves the glow and silhouette readable.
    const vignette=ctx.createRadialGradient(W/2,H/2,H*.18,W/2,H/2,W*.65);
    vignette.addColorStop(0,'rgba(0,0,0,0)'); vignette.addColorStop(1,'rgba(0,0,0,.65)');
    ctx.fillStyle=vignette; ctx.fillRect(0,0,W,H);
    if (p.hud) {
      const s=W/1920; ctx.save(); ctx.scale(s,s); ctx.fillStyle='#bcd2e9';
      ctx.font='16px monospace'; ctx.fillText('P A R T I C L E   C I N E M A',64,65);
      ctx.textAlign='right'; ctx.fillText('LIGHT / FORM / ENERGY',1856,65);
      ctx.textAlign='left'; ctx.font='20px monospace'; ctx.fillText(String(state.index+1).padStart(2,'0')+'   /   '+cue.label,64,H/s-64);
      ctx.fillStyle='rgba(170,204,241,.18)'; ctx.fillRect(64,H/s-35,1792,1);
      ctx.fillStyle='#69dfff'; ctx.fillRect(64,H/s-35,1792*Math.max(0,Math.min(1,t/p.duration)),2); ctx.restore();
    }
  }
  window.DUR=p.duration; window.PROJECT={audio:p.audio};
  window.renderAt=async(t,type='image/png',q=.94)=>{frame(t);return output.toDataURL(type,q);};
  window.renderSheet=async(times,cols=3,w=640,crop=null)=>{
    const [cx,cy,cw,ch]=crop||[0,0,W,H], h=Math.round(w*ch/cw), sheet=document.createElement('canvas');
    sheet.width=cols*w; sheet.height=Math.ceil(times.length/cols)*h; const c=sheet.getContext('2d'),ms=[];
    for(let i=0;i<times.length;i++) {
      const start=performance.now(); frame(times[i]); ms.push(Math.round(performance.now()-start));
      const x=i%cols*w,y=Math.floor(i/cols)*h; c.drawImage(output,cx,cy,cw,ch,x,y,w,h);
      c.fillStyle='#07101ccc'; c.fillRect(x,y,72,24); c.fillStyle='#fff'; c.font='14px monospace';c.fillText(times[i].toFixed(2)+'s',x+6,y+17);
    }
    return {url:sheet.toDataURL('image/jpeg',.93),ms};
  };
  window.gpuInfo=()=>{
    const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
    return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
  };
  window.particleInfo={count,trails:trailCount,quality:tier,width:W,height:H};
  const slider=document.getElementById('scrub'),status=document.getElementById('status'),play=document.getElementById('play');
  slider.max=p.duration; let playing=false,anchor=0,request=0;
  const draw=t=>{frame(t);slider.value=t;status.textContent=t.toFixed(2)+' / '+p.duration.toFixed(2)+' s';};
  const tick=now=>{if(!playing)return;const t=(now-anchor)/1000;if(t>=p.duration){playing=false;play.textContent='Replay';draw(p.duration-1/p.fps);return;}draw(t);request=requestAnimationFrame(tick);};
  play.onclick=()=>{playing=!playing;play.textContent=playing?'Pause':'Play';if(playing){if(+slider.value>=p.duration-1/p.fps)slider.value=0;anchor=performance.now()-slider.value*1000;request=requestAnimationFrame(tick);}else cancelAnimationFrame(request);};
  slider.oninput=()=>{playing=false;cancelAnimationFrame(request);play.textContent='Play';draw(+slider.value);};
  const gl=renderer.getContext(); frame(0);
  if(!renderer.info.programs.length || renderer.info.programs.some(pr=>!gl.getProgramParameter(pr.program,gl.LINK_STATUS)))
    throw new Error('A WebGL shader failed to link; inspect the browser console');
  window.ready=true;
  if(!location.search.includes('render'))draw(0);
}
