import test from 'node:test';import assert from 'node:assert/strict';import QRCode from 'qrcode';import {PNG} from 'pngjs';import {validateProductionUrl} from '../src/scripts/birthday.mjs';
test('birthday generator accepts only confirmed-style permanent GitHub Pages URLs',()=>{
 assert.equal(validateProductionUrl('https://pavie.github.io/our-little-cookbook/'),'https://pavie.github.io/our-little-cookbook/');
 for(const url of ['http://pavie.github.io/','https://localhost:4173/','https://preview.example.com/','https://pavie.github.io/?preview=1','https://user:secret@pavie.github.io/'])assert.throws(()=>validateProductionUrl(url));
});
test('QR produces vector output and high resolution black-and-white PNG with quiet border',async()=>{
 // Encoding is tested with a fixture URL; no final birthday QR is delivered for this address.
 const url='https://example.github.io/our-little-cookbook/';
 const png=PNG.sync.read(await QRCode.toBuffer(url,{width:1200,margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#FFFFFF'}}));
 assert.equal(png.width,1200);assert.equal(png.height,1200);
 for(const [x,y] of [[0,0],[40,40],[1199,1199],[600,10]]){const i=(png.width*y+x)*4;assert.deepEqual([...png.data.slice(i,i+4)],[255,255,255,255]);}
 const svg=await QRCode.toString(url,{type:'svg',margin:4,errorCorrectionLevel:'M'});assert.match(svg,/<svg/);assert.match(svg,/viewBox/);
});
