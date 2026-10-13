import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {Window} from 'happy-dom';
const demo=JSON.parse(fs.readFileSync('content/recipes/tomato-basil-pasta.json','utf8'));
const basePath=(process.env.BASE_PATH||'').replace(/\/$/,'');
function outputPath(href){
 const pathname=href.split(/[?#]/)[0];
 assert.ok(!basePath||pathname===basePath||pathname.startsWith(basePath+'/'),`Missing configured base path: ${href}`);
 return pathname.slice(basePath.length).replace(/^\//,'');
}
async function openPage(file,query='',seed={}){
 const w=new Window({url:'https://cookbook.example/'+file+query});w.document.write(fs.readFileSync(path.join('dist',file,'index.html'),'utf8'));
 for(const [key,value] of Object.entries(seed))w.localStorage.setItem('cookbook-v1:'+key,JSON.stringify(value));
 for(const [key,value] of Object.entries({window:w,document:w.document,localStorage:w.localStorage,navigator:w.navigator,location:w.location,Event:w.Event,CustomEvent:w.CustomEvent,FormData:w.FormData}))Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
 const app=await import('../src/scripts/app.mjs?test='+Math.random());const interval=app.initApp();
 return {w,d:w.document,close(){clearInterval(interval);w.close();}};
}
test('built homepage navigation and all recipe links resolve to generated files',()=>{
 const html=fs.readFileSync('dist/index.html','utf8');const w=new Window();w.document.write(html);
 assert.ok(w.document.querySelector('h1').textContent.includes('Our little cookbook'));
 assert.equal(w.document.querySelectorAll('.featured .recipe-card').length,3);
 for(const a of w.document.querySelectorAll('a[href]')){const href=a.getAttribute('href');if(href.startsWith('http')||href.startsWith('#'))continue;const p=outputPath(href);assert.ok(fs.existsSync(path.join('dist',p,'index.html')),`Missing internal page: ${href}`);}
 w.close();
});
test('library search, time filter, favourites and reset work on built HTML',async()=>{
 const p=await openPage('recipes');try{
 const search=p.d.querySelector('#search');search.value='coconut';search.dispatchEvent(new p.w.Event('input',{bubbles:true}));
 assert.equal(p.d.querySelectorAll('.recipe-card:not([hidden])').length,1);assert.equal(p.d.querySelector('.recipe-card:not([hidden])').dataset.slug,'chickpea-curry-and-rice');
 search.value='';const form=p.d.querySelector('#recipe-filters');form.elements.time.value='20';form.dispatchEvent(new p.w.Event('change',{bubbles:true}));assert.equal(p.d.querySelectorAll('.recipe-card:not([hidden])').length,1);
 p.d.querySelector('.recipe-card:not([hidden]) [data-favourite]').click();assert.deepEqual(JSON.parse(p.w.localStorage.getItem('cookbook-v1:favourites')),[demo.slug]);
 form.reset();await new Promise(r=>setTimeout(r,5));assert.equal(p.d.querySelectorAll('.recipe-card:not([hidden])').length,4);
 }finally{p.close();}
});
test('ingredient quantities, checklists and scaled shopping persist',async()=>{
 const p=await openPage('recipes/'+demo.slug);try{
 p.d.querySelector('#servings-up').click();assert.equal(p.d.querySelector(`[data-quantity="${demo.groups[0].ingredients[0].id}"]`).textContent,'270');
 const first=p.d.querySelector('[data-ingredient]');first.click();assert.ok(JSON.parse(p.w.localStorage.getItem('cookbook-v1:recipe:'+demo.slug)).checked.includes(first.dataset.ingredient));
 p.d.querySelector('#add-shopping').click();const shopping=JSON.parse(p.w.localStorage.getItem('cookbook-v1:shopping'));assert.equal(shopping.length,demo.groups[0].ingredients.length-1);assert.ok(!shopping.some(i=>i.name==='Dried spaghetti'));
 p.d.querySelector('#reset-ingredients').click();assert.ok(!first.checked);
 }finally{p.close();}
});
test('recipe checklist restores after navigation',async()=>{
 const id=demo.groups[0].ingredients[0].id,p=await openPage('recipes/'+demo.slug,'',{['recipe:'+demo.slug]:{servings:4,checked:[id],completed:[],index:0}});try{
 assert.equal(p.d.querySelector('#servings').value,'4');assert.ok(p.d.querySelector(`[data-ingredient="${id}"]`).checked);assert.equal(p.d.querySelector(`[data-quantity="${id}"]`).textContent,'360');
 }finally{p.close();}
});
test('cooking progress, revisit, step ingredients and completion work',async()=>{
 const p=await openPage('cook/'+demo.slug);try{
 assert.match(p.d.querySelector('#cooking-title').textContent,/Get everything/);p.d.querySelector('#step-complete').click();assert.equal(p.d.querySelector('#cooking-title').textContent,'Start the pasta');assert.equal(p.d.querySelector('#cooking-progress').value,1);
 assert.match(p.d.querySelector('#cooking-ingredients').textContent,/180 g Dried spaghetti/);
 p.d.querySelector('#step-previous').click();assert.equal(p.d.querySelector('#step-complete').textContent,'Completed ✓');p.d.querySelector('#step-next').click();
 p.d.querySelector('#step-complete').click();p.d.querySelector('#step-complete').click();p.d.querySelector('#step-complete').click();assert.equal(p.d.querySelector('#cooking-finished').hidden,false);
 }finally{p.close();}
});
test('two recipe timers can start together, pause, reset and dismiss',async()=>{
 const p=await openPage('recipes/'+demo.slug);try{
 const buttons=[...p.d.querySelectorAll('[data-start-timer]')];buttons[0].click();buttons[1].click();let stored=JSON.parse(p.w.localStorage.getItem('cookbook-v1:timers'));assert.equal(Object.keys(stored).length,2);assert.ok(Object.values(stored).every(t=>t.status==='running'&&t.deadline>Date.now()));
 p.d.querySelector('[data-timer-action=pause]').click();stored=JSON.parse(p.w.localStorage.getItem('cookbook-v1:timers'));assert.ok(Object.values(stored).some(t=>t.status==='paused'));
 p.d.querySelector('[data-timer-action=reset]').click();p.d.querySelector('[data-timer-action=remove]').click();assert.equal(Object.keys(JSON.parse(p.w.localStorage.getItem('cookbook-v1:timers'))).length,1);
 }finally{p.close();}
});
test('cooking state restores and unsupported wake lock has a clear fallback',async()=>{
 const p=await openPage('cook/'+demo.slug,'',{['recipe:'+demo.slug]:{servings:3,index:2,completed:[demo.steps[0].id],checked:[]}});try{
 assert.equal(p.d.querySelector('#cooking-title').textContent,'Make the sauce alongside it');assert.equal(p.d.querySelector('#cooking-progress').value,1);p.d.querySelector('#wake-button').click();assert.match(p.d.querySelector('#wake-status').textContent,/unavailable|could not/);
 }finally{p.close();}
});
test('shopping checkbox and remove control work on built HTML',async()=>{
 const p=await openPage('shopping','',{shopping:[{id:'a',name:'Rice',unit:'g',quantity:150,note:'',sources:['Curry'],checked:false}]});try{
 p.d.querySelector('.shopping-item input').click();assert.equal(JSON.parse(p.w.localStorage.getItem('cookbook-v1:shopping'))[0].checked,true);p.d.querySelector('.remove-item').click();assert.equal(p.d.querySelector('#shopping-empty').hidden,false);
 }finally{p.close();}
});
test('all production assets exist and contain no external runtime services',()=>{
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const f of walk('dist').filter(f=>f.endsWith('.html'))){const w=new Window();w.document.write(fs.readFileSync(f,'utf8'));for(const e of w.document.querySelectorAll('img[src],script[src],link[rel=stylesheet]')){const src=e.getAttribute('src')||e.getAttribute('href');if(!src)continue;assert.ok(!src.startsWith('http'),`External runtime asset: ${src}`);const p=outputPath(src);assert.ok(fs.existsSync(path.join('dist',p)),`Missing asset in ${f}: ${src}`);}w.close();}
});
