import test from 'node:test';import assert from 'node:assert/strict';
import {scaledQuantity,formatQuantity,timerRemaining,timerAction,searchRecipes,addShoppingItems} from '../src/lib/core.mjs';
test('servings scale numbers, preserve fixed amounts and round counted items',()=>{
 assert.equal(scaledQuantity({quantity:150},6,2),450);
 assert.equal(scaledQuantity({quantity:.5,scaling:'fixed'},6,2),.5);
 assert.equal(scaledQuantity({quantity:1,roundTo:1},3,2),2);
 assert.equal(scaledQuantity({quantity:null},4,2),null);
 assert.equal(formatQuantity(.5),'½');assert.equal(formatQuantity(1.25),'1¼');
});
test('timers count from deadlines and catch up after browser suspension',()=>{
 let t={duration:12000,remaining:12000,status:'idle'};
 t=timerAction(t,'start',1000);assert.equal(timerRemaining(t,6000),7000);assert.equal(timerRemaining(t,90000),0);
 t=timerAction(t,'pause',6000);assert.equal(t.remaining,7000);assert.equal(timerRemaining(t,50000),7000);
 t=timerAction(t,'start',50000);assert.equal(t.deadline,57000);
 t=timerAction(t,'reset',51000);assert.equal(t.status,'idle');assert.equal(t.remaining,12000);
});
test('concurrent timers have independent deadlines and pause state',()=>{
 const a=timerAction({duration:12000,remaining:12000,status:'idle'},'start',0);
 const b=timerAction({duration:25000,remaining:25000,status:'idle'},'start',0);
 assert.equal(timerRemaining(a,15000),0);assert.equal(timerRemaining(b,15000),10000);
 assert.equal(timerRemaining(timerAction(b,'pause',15000),20000),10000);
});
const recipes=[{slug:'curry',title:'Chickpea curry',type:'Curries',cuisine:'Indian',tags:['comfort'],difficulty:'Nice and Simple',prepMinutes:10,cookMinutes:20,restMinutes:5,featured:true,added:'2026-10-01',groups:[{ingredients:[{name:'Coconut milk'}]}]},{slug:'pasta',title:'Basil pasta',type:'Pasta',cuisine:'Italian',difficulty:'Nice and Simple',prepMinutes:5,cookMinutes:10,tags:['quick'],added:'2026-10-12'}];
test('search finds ingredients, tags, type and recipe names',()=>{
 for(const q of ['coconut','comfort','curries','chickpea'])assert.equal(searchRecipes(recipes,q)[0].slug,'curry');
 assert.equal(searchRecipes(recipes,'quick')[0].slug,'pasta');assert.equal(searchRecipes(recipes,'unknown').length,0);
});
test('filters combine, sorting includes rest and local saved list',()=>{
 assert.equal(searchRecipes(recipes,'',{time:20})[0].slug,'pasta');
 assert.equal(searchRecipes(recipes,'',{type:'Curries',cuisine:'Indian'})[0].slug,'curry');
 assert.equal(searchRecipes(recipes,'',{time:30,type:'Curries'}).length,0);
 assert.equal(searchRecipes(recipes,'',{},'recent')[0].slug,'pasta');
 assert.equal(searchRecipes(recipes,'',{saved:true},'alpha',['curry'])[0].slug,'curry');
});
test('shopping list combines compatible ingredients but keeps incompatible units separate',()=>{
 const result=addShoppingItems([],[{name:'Rice',quantity:150,unit:'g',note:'',source:'Curry'},{name:'rice',quantity:100,unit:'g',note:'',source:'Soup'},{name:'Rice',quantity:1,unit:'kg',note:'',source:'Batch'},{name:'Salt',quantity:null,unit:'',note:'to taste',source:'Curry'}]);
 assert.equal(result.length,3);assert.equal(result[0].quantity,250);assert.deepEqual(result[0].sources,['Curry','Soup']);assert.equal(result[2].quantity,null);
});
