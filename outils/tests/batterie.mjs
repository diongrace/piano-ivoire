import puppeteer from 'puppeteer-core';
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await nav.newPage();
const erreurs = [], sons = {};
page.on('pageerror', e => erreurs.push(e.message));
page.on('response', r => { const u = r.url(); const m = u.match(/sons\/(piano|batterie)\//); if (m) sons[m[1]] = (sons[m[1]] || []).concat(r.status()); });
await page.goto('http://localhost:8767/', { waitUntil: 'networkidle0' });
// Décodage : on vérifie qu'un fichier de batterie se décode vraiment en son
const decode = await page.evaluate(async () => {
  const ctx = new AudioContext();
  const res = {};
  for (const n of ['kick', 'snare1', 'hat1', 'congaB', 'cloche', 'crash']) {
    const b = await (await fetch('sons/batterie/' + n + '.mp3')).arrayBuffer();
    const a = await ctx.decodeAudioData(b);
    const d = a.getChannelData(0); let pic = 0; for (const x of d) pic = Math.max(pic, Math.abs(x));
    res[n] = a.duration.toFixed(2) + ' s, pic ' + pic.toFixed(2);
  }
  return res;
});
for (const k of Object.keys(sons)) console.log(`Fichiers ${k} chargés : ${sons[k].filter(s => s === 200).length} / ${sons[k].length}`);
console.log('Décodage :', JSON.stringify(decode));
await page.click('#rythme-lancer'); await new Promise(r => setTimeout(r, 2500)); await page.click('#rythme-lancer');
await page.click('#mode-arrangeur'); await new Promise(r => setTimeout(r, 300));
await page.select('#a-style', 'rumba'); await page.click('#a-start'); await new Promise(r => setTimeout(r, 3000));
await page.click('#a-start'); await new Promise(r => setTimeout(r, 4000));
console.log('Rythme simple et Arrangeur (rumba) joués, erreurs JS :', erreurs.length ? erreurs.join(' / ') : 'aucune');
await nav.close();
