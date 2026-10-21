// זיכרון קטן לטעינה מהירה. הנתונים (Apps Script) אף פעם לא נשמרים כאן.
const CACHE = 'bdach-v2';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // POST ובקשות חיצוניות עוברים ישר לרשת
  // רשת קודם (כדי שעדכון באתר יגיע מיד), ואם אין קליטה: מהזיכרון
  e.respondWith(fetch(req).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r;
  }).catch(() => caches.match(req).then(m => m || caches.match('index.html'))));
});
