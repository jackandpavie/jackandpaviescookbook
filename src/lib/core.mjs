export function scaledQuantity(ingredient,servings,baseServings){
 if(ingredient.quantity===null || ingredient.quantity===undefined || ingredient.quantity==='') return null;
 let value=Number(ingredient.quantity);
 if(!Number.isFinite(value)) return null;
 if(ingredient.scaling!=='fixed') value*=servings/baseServings;
 const round=Number(ingredient.roundTo)||0;
 if(round>0) value=Math.round(value/round)*round;
 return Math.round(value*100)/100;
}
export function formatQuantity(value){
 if(value===null||value===undefined||value===''||!Number.isFinite(Number(value))) return '';
 value=Number(value);
 const whole=Math.floor(value),fraction=Math.round((value-whole)*100)/100;
 const symbols={0.25:'¼',0.5:'½',0.75:'¾'};
 return symbols[fraction]?`${whole||''}${symbols[fraction]}`:new Intl.NumberFormat('en-GB',{maximumFractionDigits:2}).format(value);
}
export function timerRemaining(timer,now=Date.now()){
 return timer.status==='running'?Math.max(0,timer.deadline-now):Math.max(0,timer.remaining||0);
}
export function timerAction(timer,action,now=Date.now()){
 const t={...timer};
 if(action==='start') {t.deadline=now+(t.remaining>0?t.remaining:t.duration);t.status='running';t.announced=false;}
 if(action==='pause') {t.remaining=timerRemaining(t,now);t.status=t.remaining?'paused':'done';t.deadline=null;}
 if(action==='reset') {t.remaining=t.duration;t.status='idle';t.deadline=null;t.announced=false;}
 return t;
}
export function searchRecipes(recipes,query='',filters={},sort='featured',favourites=[]){
 const needle=query.toLowerCase().trim();
 const list=recipes.filter(r=>{
  const ingredientNames=(r.groups||[]).flatMap(g=>(g.ingredients||[]).map(i=>i.name));
  const hay=[r.title,r.description,r.category,r.cuisine,r.mainIngredient,...(r.tags||[]),...(r.dietaryTags||[]),...ingredientNames].join(' ').toLowerCase();
  const total=(r.prepMinutes||0)+(r.cookMinutes||0)+(r.restMinutes||0);
  return (!needle||hay.includes(needle))&&(!filters.category||r.category===filters.category)&&(!filters.time||total<=Number(filters.time))&&(!filters.difficulty||r.difficulty===filters.difficulty)&&(!filters.cuisine||r.cuisine===filters.cuisine)&&(!filters.ingredient||r.mainIngredient===filters.ingredient)&&(!filters.diet||r.dietaryTags?.includes(filters.diet))&&(!filters.saved||favourites.includes(r.slug));
 });
 return list.sort((a,b)=>sort==='alpha'?a.title.localeCompare(b.title):sort==='quickest'?((a.prepMinutes||0)+(a.cookMinutes||0)+(a.restMinutes||0))-((b.prepMinutes||0)+(b.cookMinutes||0)+(b.restMinutes||0)):sort==='recent'?String(b.added||'').localeCompare(String(a.added||'')):Number(!!b.featured)-Number(!!a.featured)||a.title.localeCompare(b.title));
}
export function addShoppingItems(existing,items){
 const list=existing.map(x=>({...x}));
 for(const item of items){
  const key=[item.name.toLowerCase().trim(),(item.unit||'').toLowerCase().trim(),item.note||'',item.quantity===null?'text':'number'].join('|');
  const old=list.find(x=>x.key===key);
  if(old){if(item.quantity!==null) old.quantity=Math.round((old.quantity+item.quantity)*100)/100;old.checked=false;old.sources=[...new Set([...old.sources,item.source])];}
  else list.push({...item,key,id:item.id||key,checked:false,sources:[item.source]});
 }
 return list;
}
