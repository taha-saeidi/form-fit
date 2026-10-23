const CACHE='formfit-public-v1';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/offline.html','/favicon.svg']))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('formfit-public-')&&k!==CACHE).map(k=>caches.delete(k))))));
// Never cache authenticated HTML, API responses, profiles, videos or camera data.
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&e.request.mode==='navigate')e.respondWith(fetch(e.request).catch(()=>caches.match('/offline.html')))});
