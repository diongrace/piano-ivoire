# Outils pour modifier Piano Ivoire

- `piano-source.html` : le code du piano (HTML, CSS et JavaScript). **C'est ce fichier qu'on modifie.**
- `polices.css` : les polices intégrées, pour le mode hors ligne.
- `construire.js` : fabrique `index.html`, `sw.js`, `manifest.webmanifest` et `README.md` à la racine du dépôt.
- `tests/` : les tests automatiques (Node.js, puppeteer-core et Google Chrome).

## Faire une modification
1. Modifier `outils/piano-source.html`.
2. Lancer `node outils/construire.js` (cela change aussi la version du cache hors ligne, pour que les téléphones reçoivent la mise à jour).
3. Vérifier en local, puis `git add -A`, `git commit` et `git push` : GitHub Pages publie en 1 à 2 minutes.

Le plus simple : ouvrir Claude Code dans le dossier `Documents\piano-ivoire` et décrire la modification voulue.
