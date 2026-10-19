/* A bounded source gate, not visual or WCAG certification. Legacy CSS is reported explicitly. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(__dirname,'components.css'),'utf8');
const tokens=fs.readFileSync(path.join(__dirname,'tokens.css'),'utf8');
const checks=[];
checks.push({name:'both entry points load tokens before shared components',pass:['prototype','staff-prototype'].every(folder=>{
  const html=fs.readFileSync(path.join(root,folder,'index.html'),'utf8');
  return html.indexOf('../design/tokens.css')>=0&&html.indexOf('../design/tokens.css')<html.indexOf('../design/components.css');
})});
checks.push({name:'navy preserved',pass:/--cf-brand:\s*#001d57;/i.test(tokens)});
checks.push({name:'no raw color in shared component owner',pass:!/(#[a-f\d]{3,8}\b|rgba?\()/i.test(css)});
checks.push({name:'card API uses existing presentation owner',pass:fs.readFileSync(path.join(__dirname,'ui.js'),'utf8').includes('cardAttrs, card')});
const loadedStyles = new Set();
for (const folder of ['prototype','staff-prototype']) {
  const html=fs.readFileSync(path.join(root,folder,'index.html'),'utf8');
  checks.push({name:folder+' enables the approved shared theme',pass:html.includes('data-cf-theme="pastel"')});
  for(const match of html.matchAll(/href="([^"?]+\.css)"/g)) loadedStyles.add(path.resolve(root,folder,match[1]));
}
checks.push({name:'loaded presentation styles contain no literal colors outside tokens',pass:[...loadedStyles].filter(file=>file!==path.join(__dirname,'tokens.css')).every(file=>{
  const source=fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  return !/(#[a-f\d]{3,8}\b|rgba?\()/i.test(source);
})});
const hardcoding=[];
for(const folder of ['design','prototype','staff-prototype']){
  for(const file of fs.readdirSync(path.join(root,folder)).filter(f=>f.endsWith('.css'))){
    const text=fs.readFileSync(path.join(root,folder,file),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
    hardcoding.push({file:folder+'/'+file,colorLiterals:[...text.matchAll(/#[a-f\d]{3,8}\b|rgba?\(/gi)].length,pixelLiterals:[...text.matchAll(/\b\d+(?:\.\d+)?px\b/g)].length,
      owner:folder==='design'?'shared':loadedStyles.has(path.join(root,folder,file))?'active presentation':'archive / not loaded by current entrypoints'});
  }
}
console.log(JSON.stringify({checks,hardcoding,boundary:'Source checks only. Existing composition/media sizes remain; rendered evidence owns layout acceptance.'},null,2));
if(checks.some(c=>!c.pass))process.exitCode=1;
