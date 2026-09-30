import puppeteer from 'puppeteer-core';
import os from 'os'; import { fileURLToPath } from 'url';
const dir=os.tmpdir().split(String.fromCharCode(92)).join("/")+"/";
const wav=fileURLToPath(new URL("voix-test.wav", import.meta.url)).split(String.fromCharCode(92)).join("/");
const nav=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,
  args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+wav+'%noloop','--autoplay-policy=no-user-gesture-required']});
const p=await nav.newPage(); await p.setViewport({width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://localhost:8767/',{waitUntil:'networkidle0'});
const att=ms=>new Promise(r=>setTimeout(r,ms));
const c=async s=>{await p.waitForSelector(s);await p.$eval(s,e=>e.click())};
const lire=()=>p.$$eval('#n-resultat .n-syl',l=>l.map(b=>b.querySelector('b').textContent+(b.querySelector('small').textContent?'/'+b.querySelector('small').textContent:'')).join(' '));
await c('#mode-notes'); await p.waitForSelector('#n-micro');
console.log('mode notes affiché, zone :',await p.$eval('.zone .role',e=>e.textContent));
// Paroles
await p.type('#n-paroles','Joyeux anniversaire, joyeux anniversaire');
// 1) Micro (faux micro = le fichier chanté)
await c('#n-micro'); await att(1500);
console.log('en direct :',await p.$eval('#n-direct',e=>e.innerText.replace(/\s+/g,' ')));
await p.screenshot({path:dir+'n-direct.png'});
await att(8500); await c('#n-micro'); await att(300);
console.log('MICRO → notes :',await lire());
console.log(await p.$eval('#n-ton',e=>e.textContent),'|',await p.$eval('#n-acc',e=>e.innerText.replace(/\s+/g,' ')));
console.log('info :',await p.$eval('#n-info',e=>e.textContent));
await p.screenshot({path:dir+'n-resultat.png'});
// 2) Import du même enregistrement
await c('#n-effacer'); await c('#n-effacer');
const inp=await p.$('#n-fichier'); await inp.uploadFile(wav);
await p.waitForFunction(()=>/trouvée|Aucune/.test(document.querySelector('#n-info').textContent),{timeout:30000});
console.log('FICHIER → notes :',await lire());
console.log(await p.$eval('#n-ton',e=>e.textContent),'|',await p.$eval('#n-acc',e=>e.innerText.replace(/\s+/g,' ')));
// 3) Réécouter, transposer, envoyer dans Composer
await c('#n-rejouer'); await att(700); console.log('réécoute : syllabe allumée',await p.$$eval('.n-syl.joue',l=>l.length)>0);
await c('#n-rejouer');
await c('#n-haut'); console.log('un demi-ton plus haut :',(await lire()).split(' ').slice(0,6).join(' ')); await c('#n-bas');
await c('#n-composer'); await att(300);
console.log('Composer : mode',await p.$eval('#mode-composer',b=>b.getAttribute('aria-pressed')),'| titre',await p.$eval('#c-titre',e=>e.value),'| mesures',await p.$$eval('.c-mesure',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')).join(' | ')));
await p.screenshot({path:dir+'n-compo.png'});
// retour au mode notes : résultat conservé
await c('#mode-notes'); console.log('résultat conservé :',(await lire()).split(' ').length,'notes');
// écran portrait étroit
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}); await att(300); await p.screenshot({path:dir+'n-portrait.png'});
console.log('largeur',await p.evaluate(()=>document.documentElement.scrollWidth),'erreurs',errs);
await nav.close();
