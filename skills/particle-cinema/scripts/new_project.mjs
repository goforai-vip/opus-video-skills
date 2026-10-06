// Cross-platform scaffold; do not overwrite an existing project.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const target=process.argv[2];
if(!target)throw new Error('Usage: node scripts/new_project.mjs <project-dir>');
const out=resolve(target),template=resolve(dirname(fileURLToPath(import.meta.url)),'../template');
if(existsSync(out)&&readdirSync(out).length)throw new Error(`Destination must be empty: ${out}`);
mkdirSync(out,{recursive:true});
cpSync(template,out,{recursive:true,filter:path=>!/(^|[\\/])(node_modules|out)([\\/]|$)/.test(path)});
console.log(`Created ${out}\nNext: cd into this folder, then npm ci and npm run preview. Chrome and ffmpeg are needed for MP4 export.`);
