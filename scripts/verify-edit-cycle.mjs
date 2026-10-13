import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const filename='content/recipes/edit-cycle-check.json',photo='public/images/edit-cycle-check.webp';
const first=JSON.parse(fs.readFileSync('content/recipes/tomato-basil-pasta.json'));
const minimal={title:'Edit cycle check',slug:'edit-cycle-check',aliases:['old-edit-cycle-check'],description:'Temporary automated content pipeline fixture.',servings:2,published:true,prepMinutes:5,cookMinutes:10,image:'/images/edit-cycle-check.webp',imageAlt:'Clearly labelled generated placeholder for upload pipeline testing',groups:first.groups,steps:first.steps};
try{
 fs.copyFileSync('public/images/cover.webp',photo);fs.writeFileSync(filename,JSON.stringify(minimal));
 execFileSync('npm',['run','build'],{stdio:'pipe'});
 for(const path of ['dist/recipes/edit-cycle-check/index.html','dist/recipes/old-edit-cycle-check/index.html','dist/cook/edit-cycle-check/index.html','dist/images/edit-cycle-check.webp'])if(!fs.existsSync(path))throw new Error('Expected generated file missing: '+path);
 const page=fs.readFileSync('dist/recipes/edit-cycle-check/index.html','utf8');if(!page.includes('Edit cycle check'))throw new Error('New content not rendered');if(page.includes('id="timeline"'))throw new Error('Absent timeline should not be invented');
 console.log('Content pipeline passed: new recipe, image file, optional-field omissions, old URL alias, recipe page and cooking page. This does not test the authenticated Pages CMS upload UI.');
}finally{
 if(fs.existsSync(filename))fs.unlinkSync(filename);if(fs.existsSync(photo))fs.unlinkSync(photo);
 execFileSync('npm',['run','build'],{stdio:'pipe'});
}
