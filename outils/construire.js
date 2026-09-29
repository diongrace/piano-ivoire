const fs = require('fs');
const dir = __dirname, sortie = require('path').join(__dirname, '..') + '/';
const polices = fs.readFileSync(dir + '/polices.css', 'utf8');
const corps = fs.readFileSync(dir + '/piano-source.html', 'utf8').replace('/*POLICES*/', polices);
const version = 'v2-' + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

// 1. Version artifact (le squelette HTML est ajouté à la publication)
fs.writeFileSync(dir + '/piano-artifact.html', corps);

// 2. Application installable pour GitHub Pages
const tete = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0E0D0C">
<meta name="description" content="Piano numérique pour apprendre et accompagner : deux mains, 88 touches, rythmes, accords et tonalités.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Piano Ivoire">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icones/icone-192.png">
<link rel="apple-touch-icon" href="icones/icone-180.png">
`;
const i = corps.indexOf('<div class="app"');
fs.writeFileSync(sortie + 'index.html', tete + corps.slice(0, i) + '</head>\n<body>\n' + corps.slice(i) + '\n</body>\n</html>\n');

fs.writeFileSync(sortie + 'manifest.webmanifest', JSON.stringify({
  name: 'Piano Ivoire',
  short_name: 'Piano Ivoire',
  description: 'Piano numérique : deux mains, 88 touches, rythmes, accords et tonalités.',
  lang: 'fr',
  start_url: './',
  scope: './',
  display: 'fullscreen',
  orientation: 'landscape',
  background_color: '#0E0D0C',
  theme_color: '#0E0D0C',
  icons: [
    { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

fs.writeFileSync(sortie + 'sw.js', `// Garde le piano disponible sans Internet
const CACHE = 'piano-ivoire-${version}';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icones/icone-192.png', './icones/icone-512.png', './icones/icone-180.png',
  ...'A0 C1 Ds1 Fs1 A1 C2 Ds2 Fs2 A2 C3 Ds3 Fs3 A3 C4 Ds4 Fs4 A4 C5 Ds5 Fs5 A5 C6 Ds6 Fs6 A6 C7 Ds7 Fs7 A7 C8'.split(' ').map(n => './sons/piano/' + n + '.mp3'),
  ...'kick snare1 snare2 rim hat1 hat2 hatOuvert tomH tomB crash congaB congaH shaker1 shaker2 cloche clap1 clap2 clave tamb'.split(' ').map(n => './sons/batterie/' + n + '.mp3')];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Réseau d'abord (pour recevoir les mises à jour), sinon la copie gardée en cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
`);

fs.writeFileSync(sortie + 'README.md', `# Piano Ivoire

Piano numérique pour apprendre et accompagner le chant : deux mains, 88 touches, rythmes, accords et tonalités.
Il s'installe sur un téléphone comme une application et fonctionne sans Internet.

Son « Piano à queue » : Salamander Grand Piano (Yamaha C5) par Alexander Holm, licence CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/).\nBatterie et percussions : Versilian Community Sample Library (https://github.com/sgossner/VCSL), domaine public CC0.

Ouvre le site sur ton téléphone, puis :
- **Android (Chrome)** : menu ⋮ → **Installer l'application** (ou « Ajouter à l'écran d'accueil »).
- **iPhone (Safari)** : bouton Partager → **Sur l'écran d'accueil**.
`);
console.log('OK', version);
