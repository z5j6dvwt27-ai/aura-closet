'use strict';
// AURA CLOSET · v1.1.0 · Mejora local sin cuentas ni servicios de pago.
const ACTIVITIES=[
  {id:'reuniones',name:'Reuniones',desc:'Salón del Reino',icon:'👔'},
  {id:'predicacion',name:'Predicación',desc:'Servicio del campo',icon:'📖'},
  {id:'asambleas',name:'Asambleas',desc:'Ocasiones especiales',icon:'🏛️'},
  {id:'baloncesto',name:'Baloncesto',desc:'Partidos y juegos',icon:'🏀'},
  {id:'entrenamiento',name:'Entrenamiento',desc:'Prácticas y cancha',icon:'⛹️'},
  {id:'gym',name:'Gimnasio',desc:'Rutinas de fuerza',icon:'💪'},
  {id:'citas',name:'Citas y salidas',desc:'Momentos especiales',icon:'❤️'},
  {id:'diaria',name:'Vida diaria',desc:'Casual y viajes',icon:'✨'}
];
const TYPES=[
  {id:'superior',name:'Parte superior',icon:'👕'},
  {id:'inferior',name:'Pantalón / short',icon:'👖'},
  {id:'calzado',name:'Calzado',icon:'👟'},
  {id:'abrigo',name:'Chaqueta / abrigo',icon:'🧥'},
  {id:'accesorio',name:'Accesorio',icon:'🧢'}
];
const COLORS=[
  {id:'negro',name:'Negro',hex:'#4e5151',group:'neutral'},
  {id:'blanco',name:'Blanco',hex:'#e5e2da',group:'neutral'},
  {id:'gris',name:'Gris',hex:'#a6a7a3',group:'neutral'},
  {id:'azul',name:'Azul',hex:'#8babc6',group:'cool'},
  {id:'marino',name:'Azul marino',hex:'#6b8094',group:'neutral'},
  {id:'beige',name:'Beige / crema',hex:'#d7c1a2',group:'neutral'},
  {id:'marron',name:'Marrón',hex:'#af8d78',group:'warm'},
  {id:'verde',name:'Verde',hex:'#91ab8d',group:'cool'},
  {id:'rojo',name:'Rojo',hex:'#c98985',group:'warm'},
  {id:'rosado',name:'Rosa',hex:'#d8acae',group:'warm'},
  {id:'amarillo',name:'Amarillo',hex:'#e7d69c',group:'warm'},
  {id:'otro',name:'Otro / multicolor',hex:'#cfc3d8',group:'other'}
];
const CLIMATES=[{id:'cualquiera',name:'Cualquier clima',icon:'✨'}, {id:'calor',name:'Calor',icon:'☀️'},{id:'fresco',name:'Fresco',icon:'🍃'},{id:'lluvia',name:'Lluvia',icon:'🌧️'}];
const NAV=[{id:'inicio',name:'Inicio',icon:'⌂'},{id:'armario',name:'Mi armario',icon:'▦'},{id:'combinador',name:'Combinador',icon:'✧'},{id:'looks',name:'Mis looks',icon:'♡'},{id:'agenda',name:'Agenda',icon:'▤'},{id:'ajustes',name:'Ajustes',icon:'⚙'}];
const $=(s,root=document)=>root.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=s=>esc(s);
const colorData=id=>COLORS.find(x=>x.id===id)||COLORS[COLORS.length-1];
const actData=id=>ACTIVITIES.find(x=>x.id===id)||ACTIVITIES[7];
const typeData=id=>TYPES.find(x=>x.id===id)||TYPES[0];
const uuid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`id-${Date.now()}-${Math.floor(Math.random()*1000000)}`;
const now=()=>new Date().toISOString();
const localISODate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const DEMOS=[
  ['Camisa blanca Oxford','superior','blanco',['reuniones','predicacion','asambleas']],
  ['Camisa azul cielo','superior','azul',['reuniones','predicacion','asambleas']],
  ['Camisa de lino beige','superior','beige',['citas','diaria','predicacion']],
  ['Polo negro minimalista','superior','negro',['citas','diaria']],
  ['Camiseta deportiva negra','superior','negro',['gym','entrenamiento']],
  ['Jersey de baloncesto azul','superior','azul',['baloncesto','entrenamiento']],
  ['Pantalón de vestir negro','inferior','negro',['reuniones','predicacion','asambleas']],
  ['Pantalón chino beige','inferior','beige',['reuniones','predicacion','citas','diaria']],
  ['Jean azul oscuro','inferior','marino',['citas','diaria']],
  ['Short de baloncesto azul','inferior','azul',['baloncesto','entrenamiento']],
  ['Short deportivo gris','inferior','gris',['gym','entrenamiento']],
  ['Zapatos formales negros','calzado','negro',['reuniones','predicacion','asambleas']],
  ['Zapatos de vestir marrones','calzado','marron',['reuniones','asambleas','predicacion']],
  ['Tenis casuales blancos','calzado','blanco',['citas','diaria']],
  ['Tenis de baloncesto','calzado','azul',['baloncesto','entrenamiento']],
  ['Tenis para gimnasio','calzado','negro',['gym','entrenamiento']],
  ['Blazer azul marino','abrigo','marino',['reuniones','asambleas']],
  ['Chaqueta verde oliva','abrigo','verde',['citas','diaria']],
  ['Corbata azul marino','accesorio','marino',['reuniones','asambleas']],
  ['Reloj negro','accesorio','negro',['reuniones','predicacion','asambleas','citas','diaria']],
  ['Mochila de entrenamiento','accesorio','gris',['baloncesto','entrenamiento','gym']]
];

const dbState={db:null,mem:null};
async function openDatabase(){
  try{
    await new Promise((resolve,reject)=>{
      const request=indexedDB.open('aura-closet-database',1);
      request.onupgradeneeded=()=>{const db=request.result;for(const name of ['garments','outfits','plans','meta'])if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:'id'});};
      request.onsuccess=()=>{dbState.db=request.result;resolve();};
      request.onerror=()=>reject(request.error);
    });
  }catch(err){
    console.warn('IndexedDB no disponible; usando almacenamiento de respaldo',err);
    try{dbState.mem=JSON.parse(localStorage.getItem('aura-backup-local')||'{"garments":[],"outfits":[],"plans":[],"meta":[]}');}catch{dbState.mem={garments:[],outfits:[],plans:[],meta:[]};}
    toast('Tu navegador usará almacenamiento de respaldo. Exporta tus datos con frecuencia.');
  }
}
async function records(store){
  if(dbState.mem)return dbState.mem[store]||[];
  return new Promise((resolve,reject)=>{const req=dbState.db.transaction(store,'readonly').objectStore(store).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
}
async function put(store,item){
  if(dbState.mem){dbState.mem[store]=dbState.mem[store].filter(x=>x.id!==item.id).concat(item);localStorage.setItem('aura-backup-local',JSON.stringify(dbState.mem));return;}
  return new Promise((resolve,reject)=>{const req=dbState.db.transaction(store,'readwrite').objectStore(store).put(item);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});
}
async function del(store,id){
  if(dbState.mem){dbState.mem[store]=dbState.mem[store].filter(x=>x.id!==id);localStorage.setItem('aura-backup-local',JSON.stringify(dbState.mem));return;}
  return new Promise((resolve,reject)=>{const req=dbState.db.transaction(store,'readwrite').objectStore(store).delete(id);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});
}
async function clear(store){
  if(dbState.mem){dbState.mem[store]=[];localStorage.setItem('aura-backup-local',JSON.stringify(dbState.mem));return;}
  return new Promise((resolve,reject)=>{const req=dbState.db.transaction(store,'readwrite').objectStore(store).clear();req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});
}
const state={view:'inicio',garments:[],outfits:[],plans:[],filterActivity:'todas',filterType:'todos',filterFavorites:false,search:'',mixerActivity:'reuniones',mixerClimate:'cualquiera',selections:{},lookFilter:'todas',editPhoto:null,planDate:localISODate()};
const hasClimate=(g,climate)=>climate==='cualquiera'||!Array.isArray(g.climates)||!g.climates.length||g.climates.includes('cualquiera')||g.climates.includes(climate);
const getBudget=()=>state.garments.filter(g=>!g.demo&&Number.isFinite(Number(g.price))&&Number(g.price)>0).reduce((sum,g)=>sum+Number(g.price),0);
async function reload(){[state.garments,state.outfits,state.plans]=await Promise.all([records('garments'),records('outfits'),records('plans')]);}
async function seedDemos(){const meta=await records('meta');if(meta.some(x=>x.id==='initialized'))return;
  if((await records('garments')).length===0){for(const [name,type,color,activities] of DEMOS)await put('garments',{id:uuid(),name,type,color,activities,photo:null,notes:'Prenda de ejemplo; sustitúyela con la tuya.',demo:true,createdAt:now()});}
  await put('meta',{id:'initialized',at:now()});
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3400);}
function goto(view){state.view=view;render();window.scrollTo({top:0,behavior:'instant'});}
function categoryCount(id){return state.garments.filter(g=>g.activities.includes(id)).length;}
function garmentArt(g,cls='garment-art'){
 const c=colorData(g.color);const icon=typeData(g.type).icon;
 return `<div class="${cls}" style="--tile-color:${c.hex}">${g.photo?`<img src="${attr(g.photo)}" alt="Foto de ${attr(g.name)}" loading="lazy">`:`<span class="garment-emoji">${icon}</span>`}</div>`;
}
function thumb(g,cls='preview-art'){
 if(!g)return `<div class="${cls}"><span>＋</span></div>`;
 return `<div class="${cls}" style="--tile-color:${colorData(g.color).hex}">${g.photo?`<img src="${attr(g.photo)}" alt="${attr(g.name)}" loading="lazy">`:typeData(g.type).icon}</div>`;
}
const empty=(icon,title,desc,action='',label='')=>`<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p>${action?`<button class="btn btn-primary" data-action="${action}">${label}</button>`:''}</div>`;
function heading(k,title,sub,button=''){return `<div class="page-heading"><div><div class="eyebrow">${k}</div><h1>${title}</h1><p>${sub}</p></div>${button}</div>`;}
function demoBanner(){const count=state.garments.filter(x=>x.demo).length;return count?`<div class="demo-banner">✨ Hay <b>${count} prendas de demostración</b> para explorar la app. No son tu ropa real. Puedes borrarlas cuando quieras.<button data-action="clear-demos">Eliminar ejemplos</button></div>`:'';}
function renderNav(){const side=$('#side-nav');side.innerHTML=`<div class="side-nav">${NAV.map(n=>`<button class="nav-link ${state.view===n.id?'active':''}" data-nav="${n.id}"><span class="nav-icon">${n.icon}</span>${n.name}</button>`).join('')}</div>`;
 $('#bottom-nav').innerHTML=NAV.filter(n=>n.id!=='ajustes').map(n=>`<button class="bottom-link ${state.view===n.id?'active':''}" data-nav="${n.id}"><span class="nav-icon">${n.icon}</span><span>${n.name==='Mi armario'?'Armario':n.name==='Combinador'?'Combinar':n.name==='Mis looks'?'Looks':n.name}</span></button>`).join('');
 $('#breadcrumb').innerHTML=`TU ESPACIO <span>/</span> ${esc(NAV.find(x=>x.id===state.view)?.name.toUpperCase()||'INICIO')}`;
 $('#today-badge').textContent=new Date().toLocaleDateString('es-PR',{day:'numeric',month:'short',year:'numeric'});
}
function render(){renderNav();$('#app').innerHTML=({inicio:renderHome,armario:renderWardrobe,combinador:renderMixer,looks:renderLooks,agenda:renderAgenda,ajustes:renderSettings}[state.view]||renderHome)();}
function renderHome(){
 const own=state.garments.filter(g=>!g.demo).length;
 return `${heading('BIENVENIDO A TU ESTILO','Tu estilo. Tu esencia.','Cada ocasión merece una versión de ti.')}
 <section class="home-hero"><div class="hero-copy"><div class="eyebrow">TU ARMARIO, REINVENTADO</div><h2>Vístete con <i>intención.</i></h2><p>Organiza cada prenda, descubre combinaciones y prepara tus looks para cualquier momento de tu vida.</p><button class="btn hero-btn" data-nav="combinador">✧ Crear mi próximo look <span>↗</span></button></div><div class="hero-figure">A<span>✦</span></div></section>
 ${demoBanner()}
 <div class="stats-grid"><div class="stat"><div class="stat-icon">👕</div><div><div class="value">${own}</div><div class="key">Mis prendas</div></div></div><div class="stat"><div class="stat-icon">✦</div><div><div class="value">${state.outfits.length}</div><div class="key">Looks guardados</div></div></div><div class="stat"><div class="stat-icon">▤</div><div><div class="value">${state.plans.length}</div><div class="key">Días planificados</div></div></div></div>
 <div class="section-heading"><div><h2>Tu vida, tu estilo</h2><p>Entra en cualquier categoría para ver la ropa apropiada.</p></div><button class="btn btn-link" data-nav="armario">Ver armario →</button></div>
 <div class="category-grid">${ACTIVITIES.map(a=>`<button class="category-tile" data-action="open-category" data-id="${a.id}"><span class="cat-emoji">${a.icon}</span><span class="cat-title">${a.name}</span><span class="cat-bottom"><span class="cat-count">${categoryCount(a.id)} prendas</span><span class="cat-arrow">↗</span></span></button>`).join('')}</div>
 <div class="insight-ribbon"><div><span>♥ FAVORITOS</span><b>${state.garments.filter(g=>!g.demo&&g.favorite).length} prendas</b></div><div><span>✦ VALOR REGISTRADO</span><b>$${getBudget().toLocaleString('en-US',{maximumFractionDigits:2})}</b></div><div><span>🗓️ PRÓXIMO LOOK</span><b>${(()=>{const p=state.plans.filter(x=>x.date>=localISODate()).sort((a,b)=>a.date.localeCompare(b.date))[0];return p?esc(state.outfits.find(o=>o.id===p.outfitId)?.name||'Sin look'):'Sin planificar';})()}</b></div></div>
 <div class="mini-section"><div class="info-panel"><h3>Un armario que piensa contigo.</h3><div class="feature-row"><div class="ico">📸</div><div><strong>Fotografía toda tu ropa</strong><small>Guarda prendas y úsalas en varias categorías.</small></div></div><div class="feature-row"><div class="ico">✧</div><div><strong>Genera combinaciones</strong><small>El sistema mezcla prendas por ocasión y colores.</small></div></div><div class="feature-row"><div class="ico">🗓️</div><div><strong>Prepara tu semana</strong><small>Elige conjuntos y guárdalos para fechas especiales.</small></div></div></div><div class="look-panel"><div class="eyebrow">PRIMER PASO</div><h3>Comienza con una foto.</h3><p>No tienes que subir todo el armario hoy. Empieza con tus prendas favoritas: camisa, pantalón y zapatos.</p><button class="btn btn-primary" data-action="add-garment">＋ Añadir mi ropa</button><div class="divider"></div><div class="note">🔒 La ropa se guarda localmente en este dispositivo. Haz copias desde Ajustes.</div></div></div>`;
}
function garmentCard(g){return `<article class="garment-card"><div style="position:relative">${garmentArt(g)}<span class="card-tag">${g.demo?'EJEMPLO':typeData(g.type).name}</span><button class="fav-button ${g.favorite?'is-fav':''}" data-action="toggle-favorite" data-id="${attr(g.id)}" aria-label="${g.favorite?'Quitar de':'Añadir a'} favoritos" title="${g.favorite?'Quitar de favoritos':'Guardar favorito'}">${g.favorite?'♥':'♡'}</button></div><div class="card-body"><div class="garment-name" title="${attr(g.name)}">${esc(g.name)}</div>${g.brand?`<div class="garment-brand">${esc(g.brand)}${g.size?' · '+esc(g.size):''}</div>`:''}<div class="garment-meta"><span class="tiny-tag">${colorData(g.color).name}</span><span class="tiny-tag">${g.activities.length} áreas</span>${Number(g.price)>0?`<span class="tiny-tag">$${Number(g.price).toLocaleString('en-US',{maximumFractionDigits:2})}</span>`:''}</div><div class="card-actions"><button class="text-btn" data-action="edit-garment" data-id="${attr(g.id)}">✎ Editar</button><button class="text-btn danger" data-action="delete-garment" data-id="${attr(g.id)}">✕ Eliminar</button></div></div></article>`;}
function filteredGarments(){const q=state.search.trim().toLocaleLowerCase();return [...state.garments].filter(g=>(state.filterActivity==='todas'||g.activities.includes(state.filterActivity))&&(state.filterType==='todos'||g.type===state.filterType)&&(!state.filterFavorites||g.favorite)&&(!q||`${g.name} ${g.brand||''} ${g.size||''} ${g.notes||''} ${colorData(g.color).name}`.toLocaleLowerCase().includes(q))).sort((a,b)=>(a.demo?1:0)-(b.demo?1:0)||b.createdAt.localeCompare(a.createdAt));}
function renderWardrobe(){
 const items=filteredGarments();return `${heading('INVENTARIO PERSONAL','Mi armario','Todas tus prendas, organizadas en un mismo lugar.',`<button class="btn btn-primary" data-action="add-garment">＋ Añadir prenda</button>`)}${demoBanner()}
 <div class="filter-bar"><input id="wardrobe-search" class="search" type="search" placeholder="⌕  Buscar prendas..." value="${attr(state.search)}" aria-label="Buscar prendas"><select class="filter-select" id="type-filter" aria-label="Filtrar por tipo"><option value="todos">Todos los tipos</option>${TYPES.map(t=>`<option value="${t.id}" ${state.filterType===t.id?'selected':''}>${t.name}</option>`).join('')}</select></div>
 <div class="filter-scroll" style="margin-bottom:18px"><button class="pill ${state.filterFavorites?'active':''}" data-action="toggle-favorites-filter">♥ Favoritos (${state.garments.filter(g=>g.favorite).length})</button><button class="pill ${state.filterActivity==='todas'?'active':''}" data-action="filter-activity" data-id="todas">✦ Todas</button>${ACTIVITIES.map(a=>`<button class="pill ${state.filterActivity===a.id?'active':''}" data-action="filter-activity" data-id="${a.id}">${a.icon} ${a.name}</button>`).join('')}</div>
 <div class="garment-grid" id="garment-grid">${items.length?items.map(garmentCard).join(''):empty('👕','Sin prendas en esta vista','Añade ropa o cambia tus filtros para ver resultados.','add-garment','＋ Añadir prenda')}</div>`;
}
function candidates(type){return state.garments.filter(g=>g.type===type&&g.activities.includes(state.mixerActivity)).sort((a,b)=>Number(hasClimate(b,state.mixerClimate))-Number(hasClimate(a,state.mixerClimate))||Number(Boolean(b.favorite))-Number(Boolean(a.favorite)));}
function styleAdvice(){const gs=TYPES.map(t=>state.garments.find(g=>g.id===state.selections[t.id])).filter(Boolean);if(!gs.length)return 'Selecciona prendas o pulsa «Combinar automáticamente» para recibir una sugerencia adaptada a la ocasión.';const colors=new Set(gs.map(g=>g.color));const neutral=gs.filter(g=>colorData(g.color).group==='neutral').length;const main=actData(state.mixerActivity).name.toLowerCase();const weather=state.mixerClimate==='cualquiera'?'':` Revisa que las prendas sean adecuadas para ${CLIMATES.find(c=>c.id===state.mixerClimate)?.name.toLowerCase()}.`;return `${gs.length} piezas para ${main}. ${colors.size<=2?'Una paleta coordinada y fácil de combinar.':neutral>=2?'Los tonos neutros equilibran los colores de tu conjunto.':'Prueba sustituir una pieza por un tono neutro para un look más equilibrado.'}${weather} Recomendación basada en reglas, no en una IA externa.`;}
function renderMixer(){
 return `${heading('ESTILISTA PERSONAL','Combinador de looks','Selecciona tus prendas o deja que el sistema cree una propuesta.',`<button class="btn btn-secondary" data-action="generate-look">✧ Sorpréndeme</button>`)}${demoBanner()}
 <div class="section-heading"><div><h2>¿Para qué ocasión?</h2><p>Solo se muestran las prendas marcadas para esta actividad.</p></div></div>
 <div class="filter-scroll" style="margin-bottom:27px">${ACTIVITIES.map(a=>`<button class="pill ${state.mixerActivity===a.id?'active':''}" data-action="mixer-activity" data-id="${a.id}">${a.icon} ${a.name}</button>`).join('')}</div>
 <div class="climate-panel"><div><b>🌤️ Ajustar al clima</b><small>Selección manual, sin ubicación ni pagos.</small></div><div class="climate-options">${CLIMATES.map(c=>`<button class="pill ${state.mixerClimate===c.id?'active':''}" data-action="mixer-climate" data-id="${c.id}">${c.icon} ${c.name}</button>`).join('')}</div></div>
 <div class="mixer-split"><div class="mixer-main">${TYPES.map(t=>{const c=candidates(t.id);return `<div class="slot-section"><div class="slot-heading">${t.icon} ${t.name}<small>${c.length} opciones · ${['abrigo','accesorio'].includes(t.id)?'opcional':'principal'}</small></div><div class="slot-scroll">${c.length?c.map(g=>`<button class="slot-card ${state.selections[t.id]===g.id?'chosen':''}" data-action="choose-slot" data-slot="${t.id}" data-id="${attr(g.id)}"><div class="slot-art" style="--tile-color:${colorData(g.color).hex}">${g.photo?`<img src="${attr(g.photo)}" alt="${attr(g.name)}" loading="lazy">`:typeData(g.type).icon}</div><span class="slot-label">${esc(g.name)}</span>${state.selections[t.id]===g.id?'<span class="slot-selected">✓</span>':''}</button>`).join(''):`<div class="slot-none">Todavía no hay prendas de este tipo en ${actData(state.mixerActivity).name.toLowerCase()}.</div>`}</div></div>`;}).join('')}</div>
 <aside class="preview-panel"><div class="eyebrow">TU COMBINACIÓN</div><h3>Vista de tu look</h3><p>${actData(state.mixerActivity).icon} ${actData(state.mixerActivity).name}</p>
 ${TYPES.map(t=>{const g=state.garments.find(x=>x.id===state.selections[t.id]);return `<div class="preview-piece">${thumb(g)}<div><b>${g?esc(g.name):`Sin ${t.name.toLowerCase()}`}</b><small>${t.name}${g?' · '+colorData(g.color).name:''}</small></div></div>`;}).join('')}
 <button class="btn btn-primary" data-action="save-look">♡ Guardar este look</button><div class="advisor-box"><b>✦ AURA STYLIST · Sin conexión</b><p>${styleAdvice()}</p></div><button class="btn btn-soft" data-action="generate-look">✧ Combinar automáticamente</button><button class="btn btn-link" data-action="clear-selection">Vaciar selección</button><p class="note">Las sugerencias usan reglas de categorías y colores. No son recomendaciones generadas por una IA en la nube.</p></aside></div>`;
}
function getLookItems(outfit){return (outfit.garmentIds||[]).map(id=>state.garments.find(g=>g.id===id)).filter(Boolean);}
function lookCard(outfit){const list=getLookItems(outfit);return `<article class="look-card"><div class="look-visual">${list.length?list.slice(0,6).map(g=>`<div class="look-item" style="background:${colorData(g.color).hex}38">${g.photo?`<img src="${attr(g.photo)}" alt="${attr(g.name)}" loading="lazy">`:typeData(g.type).icon}</div>`).join(''): '<div class="look-item">👕</div>'}</div><div class="look-info"><span class="tag-accent">${actData(outfit.activity).icon} ${actData(outfit.activity).name}</span><h3 style="margin-top:11px">${esc(outfit.name)}</h3><p>${list.length} prendas${outfit.notes?' · '+esc(outfit.notes):''}</p><div class="look-actions"><button class="text-btn" data-action="mark-worn" data-id="${attr(outfit.id)}">✓ Lo usé${outfit.wearCount?' ('+outfit.wearCount+')':''}</button><button class="text-btn" data-action="wear-look" data-id="${attr(outfit.id)}">✧ Editar combinación</button><button class="text-btn danger" data-action="delete-look" data-id="${attr(outfit.id)}">✕</button></div></div></article>`;}
function renderLooks(){const fits=state.outfits.filter(x=>state.lookFilter==='todas'||x.activity===state.lookFilter).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 return `${heading('TU COLECCIÓN','Mis looks','Conjuntos favoritos listos para volver a usar.',`<button class="btn btn-primary" data-nav="combinador">✧ Crear look</button>`)}<div class="filter-scroll" style="margin-bottom:23px"><button class="pill ${state.lookFilter==='todas'?'active':''}" data-action="filter-looks" data-id="todas">Todos</button>${ACTIVITIES.map(a=>`<button class="pill ${state.lookFilter===a.id?'active':''}" data-action="filter-looks" data-id="${a.id}">${a.icon} ${a.name}</button>`).join('')}</div><div class="looks-grid">${fits.length?fits.map(lookCard).join(''):empty('♡','Tu colección está esperando','Arma un conjunto en el combinador y presiona “Guardar este look”.','go-mixer','✧ Ir al combinador')}</div>`;
}
function renderAgenda(){const d=state.planDate;const saved=state.plans.filter(p=>p.date>=localISODate()).sort((a,b)=>a.date.localeCompare(b.date));const planned=state.plans.find(p=>p.date===d);const week=Array.from({length:7},(_,n)=>{const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+n);const day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');return {day,plan:state.plans.find(p=>p.date===day),date};});return `${heading('ORGANIZA TU SEMANA','Agenda de outfits','Decide tu look antes del evento. Una decisión menos en tu día.')}
 <section class="week-planner"><div class="section-heading"><div><h2>Tu próxima semana</h2><p>Toca un día para planificarlo con un look guardado.</p></div></div><div class="week-grid">${week.map(w=>{const look=state.outfits.find(x=>x.id===w.plan?.outfitId);return `<button class="week-day ${w.day===d?'selected':''}" data-action="pick-plan-date" data-id="${w.day}"><small>${esc(w.date.toLocaleDateString('es-PR',{weekday:'short'}))}</small><strong>${w.date.getDate()}</strong><span>${look?esc(look.name):'＋ Elegir look'}</span></button>`;}).join('')}</div></section>
 <div class="calendar-panel"><div class="eyebrow">PLANIFICADOR PERSONAL</div><h2>¿Qué vas a usar?</h2><p>Selecciona una fecha y uno de los looks guardados. Tu planificación permanecerá en este dispositivo.</p><form id="plan-form"><div class="plan-row"><div class="field"><label for="plan-date">Fecha</label><input type="date" id="plan-date" name="date" required value="${attr(d)}"></div><div class="field"><label for="plan-look">Look guardado</label><select id="plan-look" name="outfitId" required><option value="">Elegir un look</option>${state.outfits.map(o=>`<option value="${attr(o.id)}" ${planned?.outfitId===o.id?'selected':''}>${esc(actData(o.activity).icon+' '+o.name)}</option>`).join('')}</select></div><button type="submit" class="btn btn-primary" style="margin-bottom:16px" ${state.outfits.length?'':'disabled'}>Guardar</button></div></form>${!state.outfits.length?'<p class="note">Primero crea un look en el combinador para añadirlo a tu agenda.</p>':''}
 <div class="divider"></div><h2 style="font-size:23px">Próximos outfits</h2>${saved.length?saved.map(p=>{const fit=state.outfits.find(o=>o.id===p.outfitId);return `<div class="plan-entry"><div><b>${esc(new Date(p.date+'T12:00:00').toLocaleDateString('es-PR',{weekday:'long',day:'numeric',month:'long'}))}</b><small>${fit?esc(fit.name)+' · '+actData(fit.activity).name:'Look eliminado'}</small></div><button class="text-btn danger" data-action="delete-plan" data-id="${attr(p.id)}">Eliminar</button></div>`;}).join(''):'<p class="note">No tienes fechas futuras programadas.</p>'}</div>`;}
function renderSettings(){return `${heading('TU CONFIGURACIÓN','Ajustes','Tú controlas tu armario, tus fotografías y tus datos.')}
 <div class="settings-grid"><div class="settings-card"><div class="eyebrow">SEGURIDAD</div><h3>Tu copia de seguridad</h3><p>Descarga un archivo con tus prendas, fotos, looks y agenda. Guárdalo en Archivos o iCloud para no perder tu armario si cambias de dispositivo o limpias datos del navegador.</p><button class="btn btn-primary" data-action="export-data">↓ Exportar armario</button><button class="btn btn-secondary" data-action="import-data">↑ Importar copia</button><input type="file" id="import-file" accept=".json,application/json" hidden></div>
 <div class="settings-card"><div class="eyebrow">NUEVO EN 1.1</div><h3>Tu armario, más completo</h3><p>Marcas, tallas, precios, favoritos, clima manual, recomendaciones locales, registro de usos y agenda visual de siete días. Todo sin cuenta y sin servicios de pago.</p><span class="tag-accent">✦ AURA STYLIST LOCAL</span></div>
 <div class="settings-card"><div class="eyebrow">PRIVACIDAD</div><h3>Gratis y sin cuentas</h3><p>Las fotos y las combinaciones están almacenadas localmente. No subimos tu ropa a servidores ni cobramos por generar combinaciones. Tus datos no se sincronizan automáticamente entre dispositivos.</p><span class="tag-accent">🔒 Almacenamiento local</span></div>
 <div class="settings-card"><div class="eyebrow">PERSONALIZAR</div><h3>Ejemplos de muestra</h3><p>La primera apertura incluye prendas ficticias para probar los menús. Elimínalas y crea tu armario real con tus fotografías.</p><button class="btn btn-secondary" data-action="clear-demos">Eliminar prendas de ejemplo</button></div>
 <div class="settings-card"><div class="eyebrow">ZONA DE PELIGRO</div><h3>Reiniciar el armario</h3><p>Esto elimina todas las prendas, fotos, looks y planes de este dispositivo. No puede deshacerse si no descargaste antes una copia de seguridad.</p><button class="btn btn-danger" data-action="reset-data">Borrar todos mis datos</button></div></div><p class="note top-gap">AURA CLOSET · Versión 1.1 · Preparado para iPhone, iPad y Android · Sin dependencias externas. Para instalarla como app se debe abrir desde un sitio HTTPS.</p>`;}
function modal(html,small=false){$('#modal-root').innerHTML=`<div class="form-backdrop" data-action="backdrop"><section class="form-modal ${small?'small':''}" role="dialog" aria-modal="true">${html}</section></div>`;document.body.style.overflow='hidden';}
function closeModal(){$('#modal-root').innerHTML='';document.body.style.overflow='';state.editPhoto=null;}
function openGarmentModal(id){const g=state.garments.find(x=>x.id===id);state.editPhoto=g?.photo||null;
 modal(`<div class="modal-head"><h2>${g?'Editar prenda':'Nueva prenda'}</h2><button type="button" class="modal-close" data-action="close-modal" aria-label="Cerrar">×</button></div><form id="garment-form" data-id="${attr(g?.id||'')}">
 <label class="upload-box" for="garment-photo"><span id="image-preview">${g?.photo?`<img src="${attr(g.photo)}" alt="Vista previa">`:'📸'}</span><span><b>Subir foto de mi prenda</b><small>Desde Fotos, Archivos o cámara · Opcional</small></span><input type="file" id="garment-photo" name="photo" accept="image/*" hidden></label>
 <div class="field"><label for="garment-name">Nombre de la prenda *</label><input id="garment-name" name="name" required maxlength="70" placeholder="Ej. Camisa blanca, Jordan 1..." value="${attr(g?.name||'')}"></div>
 <div class="form-row"><div class="field"><label for="garment-type">Tipo de prenda</label><select id="garment-type" name="type">${TYPES.map(t=>`<option value="${t.id}" ${g?.type===t.id?'selected':''}>${t.icon} ${t.name}</option>`).join('')}</select></div><div class="field"><label for="garment-color">Color principal</label><select id="garment-color" name="color">${COLORS.map(c=>`<option value="${c.id}" ${g?.color===c.id?'selected':''}>${c.name}</option>`).join('')}</select></div></div>
 <div class="field"><label>¿En qué actividades usarías esta prenda? *</label><div class="activity-checks">${ACTIVITIES.map(a=>`<label><input type="checkbox" name="activities" value="${a.id}" ${g?.activities.includes(a.id)?'checked':''}>${a.icon} ${a.name}</label>`).join('')}</div></div>
 <div class="form-row"><div class="field"><label for="garment-brand">Marca (opcional)</label><input id="garment-brand" name="brand" maxlength="60" placeholder="Ej. Nike, Zara..." value="${attr(g?.brand||'')}"></div><div class="field"><label for="garment-size">Talla (opcional)</label><input id="garment-size" name="size" maxlength="30" placeholder="Ej. M, 10 US, 32x30" value="${attr(g?.size||'')}"></div></div>
 <div class="field"><label for="garment-price">Precio pagado (USD, opcional)</label><input type="number" inputmode="decimal" id="garment-price" name="price" min="0" max="1000000" step="0.01" placeholder="0.00" value="${g?.price??''}"></div>
 <div class="field"><label>¿Para qué clima funciona? (opcional)</label><div class="activity-checks">${CLIMATES.filter(c=>c.id!=='cualquiera').map(c=>`<label><input type="checkbox" name="climates" value="${c.id}" ${g?.climates?.includes(c.id)?'checked':''}>${c.icon} ${c.name}</label>`).join('')}</div><small class="hint-text">Si no seleccionas ninguno, esta prenda funciona para cualquier clima.</small></div>
 <div class="field"><label><input type="checkbox" name="favorite" ${g?.favorite?'checked':''}> ♥ Guardar como prenda favorita</label></div>
 <div class="field"><label for="garment-notes">Notas (opcional)</label><textarea name="notes" id="garment-notes" maxlength="400" placeholder="Marca, talla, ocasión, precio...">${esc(g?.demo?'':g?.notes||'')}</textarea></div>
 <div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">${g?'Guardar cambios':'Añadir al armario'}</button></div></form>`);
}
async function compressImage(file){
 if(!file||!file.type.startsWith('image/'))throw Error('Selecciona una foto válida.');
 if(file.size>22*1024*1024)throw Error('La imagen supera 22 MB. Elige una foto más pequeña.');
 const image=await new Promise((resolve,reject)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('No se pudo leer la imagen.'));};img.src=url;});
 const scale=Math.min(1,850/Math.max(image.naturalWidth,image.naturalHeight));const cvs=document.createElement('canvas');cvs.width=Math.round(image.naturalWidth*scale);cvs.height=Math.round(image.naturalHeight*scale);
 if(cvs.width===0||cvs.height===0)throw Error('Imagen inválida.');
 const ctx=cvs.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cvs.width,cvs.height);ctx.drawImage(image,0,0,cvs.width,cvs.height);return cvs.toDataURL('image/jpeg',.72);
}
async function saveGarment(form){const name=form.elements.namedItem('name').value.trim(),type=form.elements.namedItem('type').value,color=form.elements.namedItem('color').value,activities=[...form.querySelectorAll('input[name="activities"]:checked')].map(x=>x.value),notes=form.elements.namedItem('notes').value.trim(),id=form.dataset.id;
 if(!name){toast('Escribe un nombre para la prenda.');return;}
 if(!activities.length){toast('Selecciona al menos una actividad.');return;}
 const old=state.garments.find(x=>x.id===id);const brand=form.elements.namedItem('brand').value.trim(),size=form.elements.namedItem('size').value.trim(),rawPrice=form.elements.namedItem('price').value,price=rawPrice===''?null:Number(rawPrice),climates=[...form.querySelectorAll('input[name="climates"]:checked')].map(x=>x.value),favorite=form.elements.namedItem('favorite').checked;if(rawPrice!==''&&(!Number.isFinite(price)||price<0||price>1000000)){toast('El precio debe ser entre $0 y $1,000,000.');return;}await put('garments',{...old,id:id||uuid(),name,type,color,activities,notes,brand,size,price,climates,favorite,photo:state.editPhoto||null,demo:false,createdAt:old?.createdAt||now()});await reload();closeModal();render();toast(id?'Prenda actualizada ✓':'¡Prenda añadida a tu armario! ✓');
}
function harmonyScore(g,selected){let score=1;for(const other of selected){const a=colorData(g.color),b=colorData(other.color);if(a.id===b.id)score+=2.8;else if(a.group==='neutral'||b.group==='neutral')score+=3;else if(a.group===b.group)score+=2;else if((a.id==='azul'&&b.id==='marron')||(a.id==='marron'&&b.id==='azul'))score+=1.5;else score-=1.5;}return score;}
function generateLook(){const order=['superior','inferior','calzado','abrigo','accesorio'],picks={},chosen=[];
 for(const t of order){const pool=candidates(t);if(!pool.length)continue;if(['abrigo','accesorio'].includes(t)&&Math.random()<.38)continue;
  const sorted=pool.map(g=>({g,score:harmonyScore(g,chosen)+(hasClimate(g,state.mixerClimate)?3:-3)+(g.favorite?1.5:0)+Math.random()*2})).sort((a,b)=>b.score-a.score);const pick=sorted[0].g;picks[t]=pick.id;chosen.push(pick);
 }
 if(!chosen.length){toast('Primero añade prendas a esta categoría.');return;}
 state.selections=picks;render();toast('✧ Creamos una combinación por tipo y color.');
}
function openSaveLook(){const ids=Object.values(state.selections).filter(id=>state.garments.some(g=>g.id===id));if(ids.length<2){toast('Elige al menos dos prendas para guardar un look.');return;}
 modal(`<div class="modal-head"><h2>Guardar tu look</h2><button class="modal-close" data-action="close-modal">×</button></div><form id="look-form"><div class="field"><label for="look-name">¿Cómo se llama este conjunto?</label><input id="look-name" name="name" required maxlength="70" value="Look ${actData(state.mixerActivity).name}" placeholder="Ej. Reunión del domingo"></div><div class="field"><label for="look-notes">Notas (opcional)</label><textarea id="look-notes" name="notes" maxlength="200" placeholder="Detalles de esta combinación..."></textarea></div><div class="modal-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn-primary">♡ Guardar conjunto</button></div></form>`,true);
}
async function saveLook(form){const ids=TYPES.map(t=>state.selections[t.id]).filter(id=>state.garments.some(g=>g.id===id));if(ids.length<2){toast('Elige al menos dos prendas.');return;}
 await put('outfits',{id:uuid(),name:form.elements.namedItem('name').value.trim(),notes:form.elements.namedItem('notes').value.trim(),activity:state.mixerActivity,garmentIds:ids,createdAt:now()});await reload();closeModal();goto('looks');toast('¡Look guardado! ♡');}
async function exportData(){const data={format:'AURA_CLOSET_BACKUP',version:1,appVersion:'1.1.0',exportedAt:now(),garments:state.garments,outfits:state.outfits,plans:state.plans};const blob=new Blob([JSON.stringify(data)],{type:'application/json'});const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=`AURA_CLOSET_COPIA_${localISODate()}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);toast('Copia de seguridad generada. Guárdala en Archivos.');}
function isValidBackup(x){if(!x||x.format!=='AURA_CLOSET_BACKUP'||x.version!==1||!Array.isArray(x.garments)||!Array.isArray(x.outfits)||!Array.isArray(x.plans))return false;
 if(x.garments.length>4000||x.outfits.length>10000||x.plans.length>20000)return false;
 return x.garments.every(g=>typeof g.id==='string'&&typeof g.name==='string'&&g.name.length<=100&&TYPES.some(t=>t.id===g.type)&&COLORS.some(c=>c.id===g.color)&&Array.isArray(g.activities)&&g.activities.every(a=>ACTIVITIES.some(t=>t.id===a))&&(!g.photo||(typeof g.photo==='string'&&g.photo.startsWith('data:image/jpeg;base64,')&&g.photo.length<4000000)))
 &&x.outfits.every(o=>typeof o.id==='string'&&typeof o.name==='string'&&o.name.length<=100&&Array.isArray(o.garmentIds)&&o.garmentIds.every(id=>typeof id==='string')&&ACTIVITIES.some(a=>a.id===o.activity))
 &&x.plans.every(p=>typeof p.id==='string'&&typeof p.outfitId==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.date));}
async function importData(file){if(!file)return;if(file.size>80*1024*1024){toast('Archivo demasiado grande (máximo 80 MB).');return;}const content=await file.text();let data;try{data=JSON.parse(content);}catch{throw Error('Este archivo no es un JSON válido.');}
 if(!isValidBackup(data))throw Error('No es una copia compatible de AURA CLOSET.');
 if(!confirm('¿Reemplazar tu armario actual por esta copia? Primero exporta tu información actual si quieres conservarla.'))return;
 for(const kind of ['garments','outfits','plans'])await clear(kind);
 for(const kind of ['garments','outfits','plans'])for(const item of data[kind])await put(kind,item);
 await reload();render();toast('Copia restaurada correctamente ✓');
}
async function removeDemos(){const examples=state.garments.filter(g=>g.demo);if(!examples.length){toast('No tienes ejemplos que borrar.');return;}
 if(!confirm(`¿Eliminar las ${examples.length} prendas de demostración? Las prendas que hayas añadido no se tocarán.`))return;
 for(const g of examples)await del('garments',g.id);await reload();render();toast('Ejemplos eliminados ✓');}
async function resetAll(){if(!confirm('¿Eliminar TODO tu armario, fotos, looks y agenda? Esta acción es irreversible.'))return;
 if(!confirm('Última confirmación: ¿de verdad quieres borrar todos tus datos?'))return;
 for(const kind of ['garments','outfits','plans'])await clear(kind);state.selections={};await reload();goto('inicio');toast('Armario reiniciado.');}
async function handleAction(action,target){const id=target.dataset.id;
 switch(action){
  case 'add-garment':openGarmentModal();break;
  case 'edit-garment':openGarmentModal(id);break;
  case 'delete-garment':{const g=state.garments.find(x=>x.id===id);if(!g||!confirm(`¿Eliminar “${g.name}” de tu armario?`))break;await del('garments',id);for(const o of state.outfits.filter(o=>o.garmentIds.includes(id))){o.garmentIds=o.garmentIds.filter(x=>x!==id);await put('outfits',o);}for(const t of TYPES)if(state.selections[t.id]===id)delete state.selections[t.id];await reload();render();toast('Prenda eliminada.');break;}
  case 'open-category':state.filterActivity=id;state.filterType='todos';state.search='';goto('armario');break;
  case 'filter-activity':state.filterActivity=id;render();break;
  case 'toggle-favorites-filter':state.filterFavorites=!state.filterFavorites;render();break;
  case 'toggle-favorite':{const g=state.garments.find(x=>x.id===id);if(!g)break;await put('garments',{...g,favorite:!g.favorite});await reload();render();toast(g.favorite?'Quitado de favoritos':'Añadido a favoritos ♥');break;}
  case 'mixer-climate':state.mixerClimate=id;render();break;
  case 'pick-plan-date':state.planDate=id;render();break;
  case 'mark-worn':{const o=state.outfits.find(x=>x.id===id);if(!o)break;await put('outfits',{...o,wearCount:(o.wearCount||0)+1,lastWorn:now()});await reload();render();toast('Uso registrado ✓');break;}
  case 'mixer-activity':state.mixerActivity=id;state.selections={};render();break;
  case 'filter-looks':state.lookFilter=id;render();break;
  case 'choose-slot':{const slot=target.dataset.slot;state.selections[slot]=state.selections[slot]===id?null:id;render();break;}
  case 'generate-look':generateLook();break;
  case 'save-look':openSaveLook();break;
  case 'clear-selection':state.selections={};render();break;
  case 'go-mixer':goto('combinador');break;
  case 'wear-look':{const o=state.outfits.find(x=>x.id===id);if(!o)break;state.mixerActivity=o.activity;state.selections={};for(const garment of getLookItems(o))state.selections[garment.type]=garment.id;goto('combinador');break;}
  case 'delete-look':{const o=state.outfits.find(x=>x.id===id);if(!o||!confirm(`¿Eliminar el look “${o.name}”?`))break;await del('outfits',id);for(const p of state.plans.filter(p=>p.outfitId===id))await del('plans',p.id);await reload();render();toast('Look eliminado.');break;}
  case 'delete-plan':await del('plans',id);await reload();render();toast('Fecha eliminada.');break;
  case 'close-modal':closeModal();break;
  case 'backdrop':if(target.classList.contains('form-backdrop'))closeModal();break;
  case 'export-data':await exportData();break;
  case 'import-data':$('#import-file')?.click();break;
  case 'clear-demos':await removeDemos();break;
  case 'reset-data':await resetAll();break;
 }
}
function listen(){
 document.addEventListener('click',e=>{const nav=e.target.closest('[data-nav]');if(nav){goto(nav.dataset.nav);return;}const a=e.target.closest('[data-action]');if(!a)return;
   // No cerrar un modal al pulsar en su contenido.
   if(a.dataset.action==='backdrop'&&e.target!==a)return;
   handleAction(a.dataset.action,a).catch(err=>{console.error(err);toast(err.message||'No se pudo completar la operación.');});
 });
 document.addEventListener('change',async e=>{if(e.target.id==='garment-photo'&&e.target.files?.[0]){
  try{const photo=await compressImage(e.target.files[0]);state.editPhoto=photo;$('#image-preview').innerHTML=`<img src="${photo}" alt="Vista previa">`;toast('Foto optimizada para ahorrar espacio.');}catch(err){toast(err.message);}
 }else if(e.target.id==='type-filter'){state.filterType=e.target.value;render();}
 else if(e.target.id==='plan-date'){state.planDate=e.target.value;render();}
 else if(e.target.id==='import-file'&&e.target.files?.[0]){try{await importData(e.target.files[0]);}catch(err){console.error(err);toast(err.message||'No se pudo importar.');}finally{e.target.value='';}}
 });
 document.addEventListener('input',e=>{if(e.target.id==='wardrobe-search'){state.search=e.target.value;const grid=$('#garment-grid');if(grid){const items=filteredGarments();grid.innerHTML=items.length?items.map(garmentCard).join(''):empty('⌕','Sin resultados','Prueba con otra búsqueda o cambia los filtros.');}}});
 document.addEventListener('submit',e=>{if(!['garment-form','look-form','plan-form'].includes(e.target.id))return;e.preventDefault();const f=e.target;
 (async()=>{if(f.id==='garment-form')await saveGarment(f);else if(f.id==='look-form')await saveLook(f);else{
  const date=f.elements.date.value,outfitId=f.elements.outfitId.value;if(!date||!state.outfits.some(o=>o.id===outfitId)){toast('Selecciona fecha y look.');return;}
  const original=state.plans.find(p=>p.date===date);await put('plans',{id:original?.id||uuid(),date,outfitId});state.planDate=date;await reload();render();toast('Tu outfit está planificado ✓');
 }} )().catch(err=>{console.error(err);toast(err.message||'No se pudo guardar.');});
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
}
(async()=>{try{await openDatabase();await seedDemos();await reload();listen();render();if('serviceWorker'in navigator && (location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(console.warn);}catch(err){console.error(err);$('#app').innerHTML=`<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No se pudo iniciar AURA CLOSET</h3><p>Abre la aplicación desde un navegador actualizado, preferiblemente en una dirección HTTPS. Error: ${esc(err.message)}</p></div>`;}})();
