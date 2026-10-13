import fs from 'node:fs';
import path from 'node:path';
export const settings = JSON.parse(fs.readFileSync(path.resolve('content/site.json'),'utf8'));
for(const key of ['categories','featuredRecipes','collections'])if(!Array.isArray(settings[key]))settings[key]=[];
export const recipes = fs.readdirSync(path.resolve('content/recipes')).filter(f=>f.endsWith('.json')).map(f=>{
 const r=JSON.parse(fs.readFileSync(path.resolve('content/recipes',f),'utf8'));
 for(const key of ['aliases','tags','dietaryTags','gallery','equipment','groups','steps','timeline','substitutions','troubleshooting','glossary'])if(!Array.isArray(r[key]))r[key]=[];
 for(const g of r.groups)if(!Array.isArray(g.ingredients))g.ingredients=[];
 return r;
}).filter(r=>r.published);
export const total=(r:any)=>Number(r.prepMinutes||0)+Number(r.cookMinutes||0)+Number(r.restMinutes||0);
export const url=(p='')=>import.meta.env.BASE_URL.replace(/\/$/,'')+'/'+p.replace(/^\//,'');
export function media(p:any){ const s=typeof p==='string'?p:p?.src||p?.path||'';return s?url(s):''; }
export const json=(v:any)=>JSON.stringify(v).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export const colours=Object.fromEntries(['background','ink','olive','accent'].map(k=>[k,/^#[0-9a-f]{6}$/i.test(settings[k])?settings[k]:({background:'#F7F3E9',ink:'#332B24',olive:'#4F5B3A',accent:'#A3482B'} as any)[k]]));
