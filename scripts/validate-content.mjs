import fs from 'node:fs';import path from 'node:path';
import {recipeVersions} from '../src/lib/recipe-options.mjs';
const errors=[],routes=new Set(),recipeLinks=[];
const fail=(f,msg)=>errors.push(`${f}: ${msg}`);
const arr=(v)=>Array.isArray(v)?v:[];
const media=(f,v)=>{const s=typeof v==='string'?v:v?.src||v?.path||'';if(s&&(!s.startsWith('/images/')||s.includes('..')||!fs.existsSync(path.resolve('public',s.slice(1)))))fail(f,`Image not found or unsafe image path: ${s}`);};
for(const name of (fs.existsSync('content/recipes') ? fs.readdirSync('content/recipes') : []).filter(f=>f.endsWith('.json'))){
 const f='content/recipes/'+name;let source;try{source=JSON.parse(fs.readFileSync(f,'utf8'));}catch{fail(f,'Invalid JSON');continue;}
 if(!source.published)continue;
 if(source.servingRecipe)recipeLinks.push([f,source.servingRecipe]);
 if(source.recipeOptions!=null&&!Array.isArray(source.recipeOptions)){fail(f,'Recipe options must be a list');continue;}
 const optionIds=new Set();
 if(arr(source.recipeOptions).length&&source.recipeOptions[0]?.slug!==source.slug)fail(f,'The first option must use the main recipe address');
 for(const o of arr(source.recipeOptions)){
  if(!o||typeof o!=='object'){fail(f,'Recipe options must be objects');continue;}
  if(o.defaultServings!=null&&(!Number.isInteger(o.defaultServings)||o.defaultServings<1||o.defaultServings>24))fail(f,'Option portions must be a whole number from 1 to 24');
  if(o.servings!=null&&(!Number.isInteger(o.servings)||o.servings<1||o.servings>24))fail(f,'Option yield must be a whole number from 1 to 24');
  if(!o.id||optionIds.has(o.id)||!o.label)fail(f,'Each recipe option needs a unique identifier and label');optionIds.add(o.id);
  for(const k of ['groups','beforeSteps','afterSteps'])if(o[k]!=null&&!Array.isArray(o[k]))fail(f,`${k} in a recipe option must be a list`);
 }
 if(errors.length)continue;
 for(const r of recipeVersions(source)){
 if(!r.title?.trim())fail(f,'Recipe name is required');
 for(const slug of [r.slug,...arr(r.aliases)]){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))fail(f,'Use lowercase words separated by hyphens for recipe addresses');if(routes.has(slug))fail(f,`Duplicate recipe address: ${slug}`);routes.add(slug);}
 if(!Number.isFinite(r.servings)||r.servings<1||r.servings>24)fail(f,'Servings must be a number from 1 to 24');
 for(const k of ['prepMinutes','cookMinutes','restMinutes'])if(r[k]!=null&&(!Number.isFinite(r[k])||r[k]<0))fail(f,`${k} must be a non-negative number`);
 const ids=new Set(),names=new Set();
 if(!arr(r.groups).length)fail(f,'Add at least one ingredient group');
 for(const g of arr(r.groups)){if(!g.title)fail(f,'Name each ingredient group');for(const i of arr(g.ingredients)){if(!i.id||ids.has(i.id))fail(f,'Every ingredient needs a unique automatic identifier');ids.add(i.id);if(!i.name)fail(f,'Ingredient name is required');names.add(i.name?.toLowerCase());if(i.quantity!=null&&i.quantity!==''&&(!Number.isFinite(i.quantity)||i.quantity<0))fail(f,`Quantity for ${i.name} must be a number or left empty`);if(i.roundTo!=null&&(!Number.isFinite(i.roundTo)||i.roundTo<0))fail(f,'Rounding amount must be non-negative');}}
 const steps=new Set();if(!arr(r.steps).length)fail(f,'Add at least one cooking step');
 for(const s of arr(r.steps)){if(!s.id||steps.has(s.id))fail(f,'Every step needs a unique automatic identifier');steps.add(s.id);if(!s.title||!s.description)fail(f,'Give each step a title and instructions');for(const k of ['durationMinutes','timerMinutes'])if(s[k]!=null&&(!Number.isFinite(s[k])||s[k]<0))fail(f,`${k} must be non-negative`);for(const id of arr(s.ingredients))if(!ids.has(id)&&!names.has(id.toLowerCase()))fail(f,`Step ingredient “${id}” must match an ingredient name exactly`);media(f,s.image);}
 for(const t of arr(r.timeline))if(!Number.isFinite(t.start)||!Number.isFinite(t.end)||t.end<t.start||t.start<0||!t.task)fail(f,'Timeline needs a task and valid start/end minutes');
 media(f,r.image);for(const g of arr(r.gallery))media(f,g.image||g);
 if(r.imageZoom!=null&&(!Number.isFinite(r.imageZoom)||r.imageZoom<1||r.imageZoom>1.5))fail(f,'Photograph zoom must be between 1 and 1.5');
 if(r.imagePosition){const position=typeof r.imagePosition==='string'&&r.imagePosition.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);if(!position||position.slice(1).some(v=>Number(v)>100))fail(f,'Photograph focus must contain two percentages between 0% and 100%');}
 }
}
for(const [f,slug] of recipeLinks)if(!routes.has(slug))fail(f,'The linked serving recipe must match a published recipe address');
const site=JSON.parse(fs.readFileSync('content/site.json','utf8'));if(!site.title)fail('Site settings','Cookbook title is required');media('Site settings',site.heroImage);media('Site settings',site.introImage);
for(const k of ['background','ink','olive','accent'])if(!/^#[0-9a-f]{6}$/i.test(site[k]))fail('Site settings',`Invalid ${k} colour — use a six-digit hex value`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`Content valid: ${routes.size} published recipe addresses.`);
