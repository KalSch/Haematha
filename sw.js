'use strict';
const PREFIX='haematha:'+self.registration.scope+':';
const CACHE=PREFIX+'0.2.0';
const CORE=['./','./index.html'];
const OPTIONAL=['./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async cache=>{
  await cache.addAll(CORE);
  await Promise.allSettled(OPTIONAL.map(url=>cache.add(url)));
})));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(req.mode==='navigate'){
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),3500);
      try{
        const response=await fetch(req,{cache:'no-cache',signal:controller.signal});
        if(response.ok){await cache.put(req,response.clone());await cache.put('./index.html',response.clone());return response;}
        return await cache.match(req)||await cache.match('./index.html')||response;
      }catch{
        return await cache.match(req)||await cache.match('./index.html')||Response.error();
      }finally{clearTimeout(timeout);}
    }
    return await cache.match(req)||fetch(req);
  })());
});
