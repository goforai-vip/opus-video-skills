// Integration checks on actual GPU frames, requiring an installed Chrome/Chromium.
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { serve } from '../serve.mjs';
const chrome=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&existsSync(p));
if(!chrome)throw new Error('Set CHROME_PATH to run the GPU integration checks');
const {server,url}=await serve(process.cwd());let browser;
try {
  browser=await puppeteer.launch({executablePath:chrome,headless:true,args:process.platform==='linux'?['--no-sandbox']:[]});
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`${url}/particles/index.html?render&quality=draft`,{waitUntil:'networkidle0'});
  await page.waitForFunction('window.ready || window.startError');
  assert.equal(await page.evaluate(()=>window.startError),undefined);
  const capture=t=>page.evaluate(t=>window.renderAt(t),t);
  const hash=s=>createHash('sha256').update(s).digest('hex');
  const first=hash(await capture(10.5));await capture(19);assert.equal(hash(await capture(10.5)),first,'arbitrary seek must not change pixels');
  assert.notEqual(hash(await capture(10.6)),first,'motion must actually change pixels');
  const seams=await page.evaluate(async()=>{
    const out=document.getElementById('out'),ctx=out.getContext('2d'),result=[];
    for(const time of [3,6,9,12,15,18]) {
      await window.renderAt(time-.0001);const a=ctx.getImageData(0,0,out.width,out.height).data;
      await window.renderAt(time);const b=ctx.getImageData(0,0,out.width,out.height).data;
      let difference=0;for(let i=0;i<a.length;i+=4)difference+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);
      result.push({time,meanChannelDifference:difference/(out.width*out.height*3)});
    }return result;
  });
  for(const seam of seams)assert.ok(seam.meanChannelDifference<2,`discontinuity at ${seam.time}: ${seam.meanChannelDifference}`);
  const portrait=await page.evaluate(async()=>{
    Object.assign(window.PARTICLE_PROJECT,{logo:'../tests/fixtures/mark.svg',width:540,height:960,hud:false});
    const {start}=await import('/particles/engine.js');await start();await window.renderAt(10.5);
    const c=document.getElementById('out'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let lit=0;for(let i=0;i<data.length;i+=4)if(data[i]+data[i+1]+data[i+2]>120)lit++;
    return {...window.particleInfo,lit};
  });
  assert.equal(portrait.width,540);assert.equal(portrait.height,960);assert.ok(portrait.lit>1000,'local SVG must form a visible portrait mark');
  assert.deepEqual(errors,[]);
  console.log('PASS: GPU shaders, non-static motion, exact pixels after arbitrary seek, six continuous cue boundaries, local SVG and portrait output.');
  console.log(JSON.stringify(seams));
  console.log('GPU:',await page.evaluate(()=>window.gpuInfo()));
} finally {if(browser)await browser.close();await new Promise(ok=>server.close(ok));}
