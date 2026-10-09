/* Service worker : copie locale de l'application pour le hors-connexion. Aucune donnée personnelle n'y transite.
   À CHAQUE MISE À JOUR : incrémente CACHE (elan-v6, elan-v7…) et ajoute ici tout nouveau fichier. */
const CACHE = 'elan-v5';
const CODE = [
  './', './index.html', './manifest.webmanifest',
  './css/polices.css', './css/elan.css',
  './js/figure.js', './js/programme.js', './js/etat.js', './js/cloud.js', './js/calendrier-coach.js', './js/mannequin3d.js',
  './js/interface.js', './js/progression-profil.js', './js/seance.js', './js/voix.js', './js/impression.js', './js/accueil.js', './js/app.js'
];
const ASSETS = CODE.concat(['./icons/icon-192-v3.png', './icons/icon-512-v3.png', './icons/maskable-512-v3.png', './icons/apple-touch-icon-v3.png', './vendor/three.min.js']);
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* Réseau d'abord pour la page et le code (HTML, CSS, JS) : en ligne, on a toujours la dernière version,
   et la page ne se retrouve jamais avec un mélange d'anciens et de nouveaux fichiers.
   Cache d'abord pour le reste (icônes, Three.js), qui ne change pas. */
const isCode = url => url.pathname.endsWith('/') || /\.(html|css|js|webmanifest)$/.test(url.pathname);
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put('./index.html', c)); } return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  if (isCode(url) && !url.pathname.includes('/vendor/')) {
    e.respondWith(fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return res; }).catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return res; })));
});
