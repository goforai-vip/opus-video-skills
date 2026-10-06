// Own particle renderer: local HTTP, deterministic screenshots, parallel/resumable frames and H.264.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdirSync, writeFileSync, statSync, renameSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { serve } from './serve.mjs';

const args=Object.fromEntries(process.argv.slice(2).map(a=>{const i=a.indexOf('=');return i<0?[a.replace(/^--/,''),true]:[a.slice(0,i).replace(/^--/,''),a.slice(i+1)];}));
const flags=['sheet','stills','clip','frames','encode'].filter(k=>args[k]);
if(flags.length!==1)throw new Error('Choose one: --sheet=1,4,7 --stills=10 --clip --frames --encode');
const fps=Number(args.fps||30),workers=Number(args.workers||2),dir=args['frames-dir']||'out/frames';
if(!Number.isFinite(fps)||fps<=0||!Number.isInteger(workers)||workers<1||workers>8)throw new Error('fps must be positive; workers must be 1–8');
const parseTimes=s=>{const t=String(s).split(',').map(Number);if(!t.length||t.some(x=>!Number.isFinite(x)||x<0))throw new Error('Invalid times');return t;};
const run=(cmd,a)=>new Promise((ok,bad)=>{const child=spawn(cmd,a,{stdio:'inherit'});child.once('error',bad);child.once('close',code=>code===0?ok():bad(new Error(`${cmd} exited ${code}`)));});
const videoArgs=out=>['-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out];
const audioArgs=()=>args.audio?['-i',args.audio,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest']:[];
const ffmpeg=args.ffmpeg||process.env.FFMPEG_PATH||'ffmpeg';

if(args.encode) {
  const out=args.out||'out/particles.mp4';mkdirSync(dirname(out),{recursive:true});
  if(!existsSync(`${dir}/f00000.jpg`))throw new Error('No frame zero. Render the full timeline with --frames first');
  await run(ffmpeg,['-y','-loglevel','error','-framerate',String(fps),'-i',`${dir}/f%05d.jpg`,...audioArgs(),...videoArgs(out)]);
  console.log(`Wrote ${out}`);
} else {
  const chrome=[args.chrome,process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>p&&existsSync(p));
  if(!chrome)throw new Error('Chrome/Chromium not found. Set CHROME_PATH or pass --chrome=<path>');
  const {server,url}=await serve(process.cwd());let browser;
  try {
    browser=await puppeteer.launch({executablePath:chrome,headless:true,protocolTimeout:120000,
      args:[...(process.platform==='linux'?['--no-sandbox']:[]),'--ignore-gpu-blocklist',
        ...(args['soft-gl']?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:process.platform==='win32'?['--use-angle=d3d11']:process.platform==='darwin'?['--use-angle=metal']:['--use-gl=angle'])]});
    const open=async()=>{
      const page=await browser.newPage();const errors=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      await page.goto(`${url}/particles/index.html?render${args.quality?'&quality='+encodeURIComponent(args.quality):''}`,{waitUntil:'networkidle0'});
      await page.waitForFunction('window.ready || window.startError',{timeout:60000});
      const err=await page.evaluate(()=>window.startError||'');if(err||errors.length)throw new Error(err||errors.join('\n'));
      return page;
    };
    const page=await open(),duration=await page.evaluate(()=>DUR);
    if(!args.audio)args.audio=await page.evaluate(()=>PROJECT.audio);
    const snap=async(page,t,type='image/jpeg')=>{
      const data=await page.evaluate((t,type)=>window.renderAt(t,type,.94),t,type);
      return Buffer.from(data.split(',')[1],'base64');
    };
    if(args.sheet) {
      const ts=parseTimes(args.sheet),cols=Number(args.cols||3),w=Number(args.w||640);
      if(!Number.isInteger(cols)||cols<1||!Number.isInteger(w)||w<1)throw new Error('cols and w must be positive integers');
      const {url:data,ms}=await page.evaluate((ts,c,w)=>window.renderSheet(ts,c,w),ts,cols,w);
      const out=args.out||'out/check/sheet.jpg';mkdirSync(dirname(out),{recursive:true});writeFileSync(out,Buffer.from(data.split(',')[1],'base64'));
      console.log(`${out} · ${ms.join(', ')} ms/frame`);
    } else if(args.stills) {
      const out=args.out||'out/stills';mkdirSync(out,{recursive:true});
      for(const t of parseTimes(args.stills))writeFileSync(`${out}/t${t.toFixed(2).replace('.','_')}.png`,await snap(page,t,'image/png'));
      console.log(`Wrote stills to ${out}`);
    } else if(args.frames) {
      if(args.range)throw new Error('--frames renders the full timeline; use --clip --range=a:b for a segment');
      const n=Math.ceil(duration*fps);mkdirSync(dir,{recursive:true});const todo=[];
      for(let i=0;i<n;i++){const path=`${dir}/f${String(i).padStart(5,'0')}.jpg`;if(!existsSync(path)||statSync(path).size<1000)todo.push(i);}
      let next=0,done=0;const start=Date.now();await page.close();
      await Promise.all(Array.from({length:workers},async()=>{
        const worker=await open();while(next<todo.length){const i=todo[next++],path=`${dir}/f${String(i).padStart(5,'0')}.jpg`;
          writeFileSync(path+'.tmp',await snap(worker,i/fps));renameSync(path+'.tmp',path);
          if(++done%60===0||done===todo.length)console.log(`${done}/${todo.length} · ${Math.round((Date.now()-start)/done)} ms/frame`);
        }await worker.close();
      }));
      console.log(`Frames ready in ${dir}. Reuse only with unchanged config, fps and quality; otherwise choose a new --frames-dir`);
    } else {
      const range=args.range?String(args.range).split(':').map(Number):[0,duration];
      const [a,b]=range;if(range.length!==2||!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a||b>duration)throw new Error('range must be start:end within duration');
      const out=args.out||'out/particles.mp4';mkdirSync(dirname(out),{recursive:true});
      const ff=spawn(ffmpeg,['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-',
        ...(args.audio?['-ss',String(a),'-i',args.audio,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest']:[]),...videoArgs(out)],{stdio:['pipe','inherit','inherit']});
      let failure;ff.on('error',e=>{failure=e;});ff.stdin.on('error',e=>{failure=e;});
      const completion=new Promise((ok,bad)=>{ff.once('error',bad);ff.once('close',code=>code===0?ok():bad(new Error(`ffmpeg exited ${code}`)));});
      // Mark rejection handled immediately; await it after feeding, so failed encoders never report success.
      completion.catch(()=>{});
      const n=Math.round((b-a)*fps),start=Date.now();
      try {
        for(let i=0;i<n;i++){
          const buf=await snap(page,a+i/fps);if(failure)throw failure;
          if(!ff.stdin.write(buf))await Promise.race([once(ff.stdin,'drain'),completion.then(()=>{throw new Error('Encoder closed early');})]);
          if(i%60===0||i===n-1)console.log(`${i+1}/${n} · ${Math.round((Date.now()-start)/(i+1))} ms/frame`);
        }
        ff.stdin.end();await completion;console.log(`Wrote ${out} (${(n/fps).toFixed(2)} s)`);
      } catch(e){ff.kill();throw e;}
    }
  } finally {
    if(browser)await browser.close();await new Promise(ok=>server.close(ok));
  }
}
