import puppeteer from 'puppeteer-core';
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await nav.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const erreurs = []; page.on('pageerror', e => erreurs.push(e.message));
await page.goto('http://localhost:8767/', { waitUntil: 'networkidle0' });
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.reload({ waitUntil: 'networkidle0' });
await page.click('#mode-arrangeur'); await new Promise(r => setTimeout(r, 300));
const pause = ms => new Promise(r => setTimeout(r, ms));
// appuie sur des notes (par numéro MIDI) avec plusieurs doigts, puis relâche
const jouer = (notes, tenir = 150) => page.evaluate(async (notes, tenir) => {
  const ids = [];
  notes.forEach((m, i) => { const t = document.querySelector(`.touches [data-midi="${m}"]`); if (!t) return; const r = t.getBoundingClientRect();
    const id = 50 + i + Math.floor(Math.random() * 1000); ids.push(id);
    t.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: id, clientX: r.x + r.width / 2, clientY: r.y + r.height * 0.8 })); });
  await new Promise(r => setTimeout(r, tenir));
  ids.forEach(id => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: id })));
}, notes, tenir);
const etat = () => page.evaluate(() => ({
  accord: document.getElementById('a-accord').textContent,
  bouton: document.getElementById('a-start').textContent,
  section: [...document.querySelectorAll('[data-sec][aria-pressed="true"]')].map(b => b.textContent).join(','),
  attente: [...document.querySelectorAll('[data-sec].attente')].map(b => b.textContent).join(','),
  coups: +(document.querySelector('.arr').dataset.coups || 0),
  gauches: document.querySelectorAll('.touche.gauche').length,
  split: document.getElementById('a-split').textContent,
  bpm: document.getElementById('bpm-aff').textContent
}));
let e = await etat();
console.log(`Panneau prêt · touches main gauche : ${e.gauches} (sous ${e.split}) · style ${await page.$eval('#a-style', s => s.selectedOptions[0].text)} · ${e.bpm}`);
await jouer([48, 52, 55]); await pause(1500);            // Do-Mi-Sol à la main gauche
e = await etat(); console.log(`Main gauche Do-Mi-Sol → accord « ${e.accord} », démarrage synchronisé : ${e.bouton}, section ${e.section}, notes d'orchestre jouées : ${e.coups}`);
const avant = e.coups;
await jouer([57, 48, 52]); await pause(400);             // La-Do-Mi
e = await etat(); console.log(`Main gauche La-Do-Mi → accord « ${e.accord} » (relance immédiate : +${e.coups - avant} notes)`);
await page.click('#a-b'); await pause(200);
e = await etat(); console.log(`Bouton B touché → en attente : ${e.attente || '—'} (section actuelle ${e.section})`);
await pause(2800);
e = await etat(); console.log(`Mesure suivante → section ${e.section}`);
await page.click('#a-break'); await pause(2800);
e = await etat(); console.log(`Break → section ${e.section}`); await pause(2600);
e = await etat(); console.log(`Après le break → section ${e.section}`);
await page.click('#a-un'); await jouer([50]); await pause(300);
e = await etat(); console.log(`Mode « un doigt », touche Ré seule → « ${e.accord} »`);
await jouer([57, 56]); await pause(300);
e = await etat(); console.log(`Un doigt : La + noire à sa gauche → « ${e.accord} »`);
await jouer([55, 53]); await pause(300);
e = await etat(); console.log(`Un doigt : Sol + blanche à sa gauche → « ${e.accord} »`);
await jouer([64, 67], 300);                                // main droite
console.log('Main droite : notes jouées normalement');
await page.click('#a-start'); await pause(200);
e = await etat(); console.log(`Bouton Arrêter → fin demandée : attente « ${e.attente} »`);
await pause(6000);
e = await etat(); console.log(`Après la fin → ${e.bouton}`);
console.log('Erreurs JS :', erreurs.length ? erreurs.join(' / ') : 'aucune');
await page.screenshot({ path: process.argv[2] });
await nav.close();
