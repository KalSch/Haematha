// Bundles local sources into one playable HTML. The game itself needs no Node runtime.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
let html = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8');
const css = ['style.css', 'touch.css'].map(name => fs.readFileSync(path.join(root, name), 'utf8')).join('\n');
html = html.replace('<link rel="stylesheet" href="style.css">', () => '<style id="gameStyles">\n' + css + '\n</style>');
for (const name of ['app.js', 'controls.js']) {
  const source = fs.readFileSync(path.join(root, name), 'utf8').replace(/<\/script/gi, '<\\/script');
  html = html.replace(`<script src="${name}" defer></script>`, () => `<script data-source="${name}">\n${source}\n</script>`);
}
html = html.replace('FIRST SUMMER / BUILD 0.1', 'FIRST SUMMER / BUILD 0.2.3');
if (html.includes('src="app.js"') || html.includes('href="style.css"')) throw Error('Incomplete bundle');
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('Built index.html: embedded styles, game, and controls.');
