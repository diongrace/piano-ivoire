import puppeteer from 'puppeteer-core';
const nav = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await nav.newPage();
await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
const erreurs = []; page.on('pageerror', e => erreurs.push(e.message));
await page.goto('http://localhost:8767/', { waitUntil: 'networkidle0' });
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.reload({ waitUntil: 'networkidle0' });
// 2 mains : 5 doigts sur chaque clavier
await page.click('#mode-deux');
await new Promise(r => setTimeout(r, 300));
const points = await page.evaluate(() => {
  const res = [];
  document.querySelectorAll('.touches').forEach(z => {
    [...z.querySelectorAll('.touche.blanche')].slice(0, 9).filter((_, i) => i % 2 === 0).forEach(t => {
      const r = t.getBoundingClientRect(); res.push({ x: r.x + r.width / 2, y: r.y + r.height - 25 });
    });
  });
  return res;
});
const cdp = await page.createCDPSession();
const touches = points.map((p, i) => ({ x: p.x, y: p.y, id: i + 1, radiusX: 8, radiusY: 8, force: 1 }));
// Les doigts se posent un par un, comme sur un vrai clavier
for (let i = 1; i <= touches.length; i++) {
  await cdp.send('Input.dispatchTouchEvent', { type: i === 1 ? 'touchStart' : 'touchStart', touchPoints: touches.slice(0, i) });
}
await new Promise(r => setTimeout(r, 200));
const pendant = await page.evaluate(() => ({ enfoncees: document.querySelectorAll('.touche.appuyee').length, accord: document.getElementById('accord').textContent }));
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await new Promise(r => setTimeout(r, 200));
const apres = await page.evaluate(() => document.querySelectorAll('.touche.appuyee').length);
console.log(`Doigts posés : ${touches.length} → touches enfoncées à l'écran : ${pendant.enfoncees} (accord affiché : « ${pendant.accord} »)`);
console.log(`Après avoir levé les doigts : ${apres} touche(s) encore enfoncée(s)`);
// Tempo : rester appuyé sur +
const plus = await page.$('#bpm-plus'); const b = await plus.boundingBox();
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
await new Promise(r => setTimeout(r, 6000)); await page.mouse.up();
console.log('Tempo après 6 s appuyé sur + :', await page.$eval('#bpm-aff', e => e.textContent));
await page.evaluate(() => { const c = document.getElementById('bpm-saisie'); c.value = '1000'; c.dispatchEvent(new Event('change')); });
console.log('Tempo tapé « 1000 » :', await page.$eval('#bpm-aff', e => e.textContent));
await page.evaluate(() => { const c = document.getElementById('bpm-saisie'); c.value = '5000'; c.dispatchEvent(new Event('change')); });
console.log('Tempo tapé « 5000 » (refusé) :', await page.$eval('#bpm-aff', e => e.textContent));
await page.click('#rythme-lancer'); await new Promise(r => setTimeout(r, 1500));
console.log('Rythme à 1000 bpm lancé, erreurs JS :', erreurs.length ? erreurs.join(' / ') : 'aucune');
await nav.close();
