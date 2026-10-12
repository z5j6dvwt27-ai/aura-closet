// AURA CLOSET 1.1 — actualizaciones frescas con respaldo sin conexión.
const CACHE_NAME = 'aura-closet-v1.1.0';
const ASSETS = ['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('aura-closet-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request, url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith((async()=>{
  try{const response=await fetch(req);if(response.ok&&response.type==='basic'){
   const cache=await caches.open(CACHE_NAME);cache.put(req,response.clone()).catch(()=>{});
  }return response;}catch(_){return (await caches.match(req))||(req.mode==='navigate'?await caches.match('./index.html'):undefined)||Response.error();}
 })());
});
