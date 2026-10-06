import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, relative, extname, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function serve(root, port=0) {
  root=resolve(root);
  const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
  const server=http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
      const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/particles/index.html':url.pathname));
      const rel=relative(root,path);
      if(rel.startsWith('..')||isAbsolute(rel)){res.writeHead(403).end();return;}
      if(!(await stat(path)).isFile()){res.writeHead(404).end();return;}
      res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});
      const stream=createReadStream(path);stream.on('error',()=>res.destroy());stream.pipe(res);
    } catch {res.writeHead(404).end();}
  });
  await new Promise((ok,bad)=>{server.once('error',bad);server.listen(port,'127.0.0.1',ok);});
  return {server,url:`http://127.0.0.1:${server.address().port}`};
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1]||'')).href) {
  const {url}=await serve(process.cwd(),Number(process.env.PORT||4173));
  console.log(`Particle Cinema: ${url}/particles/index.html`);
}
