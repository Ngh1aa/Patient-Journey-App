/**
 * Script kiểm tra độ tương phản màu theo tiêu chuẩn WCAG 2.1 AA
 * Chữ thường: tối thiểu 4.5:1
 * Chữ lớn (>=18pt hoặc >=14pt đậm) & UI Components/Icons: tối thiểu 3.0:1
 */

function parseHex(hex) {
  hex = hex.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrast(hex1, hex2) {
  const L1 = getLuminance(parseHex(hex1));
  const L2 = getLuminance(parseHex(hex2));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const fs = require('node:fs'), path = require('node:path');
const css = fs.readFileSync(path.join(__dirname,'../design/tokens.css'),'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*([^;{}]+);/gi)].map(m=>[m[1],m[2].trim()]));
function resolve(name) {
 const value=tokens[name];if(!value)throw Error('Missing token '+name);
 const alias=value.match(/^var\(--([\w-]+)\)$/);if(alias)return resolve(alias[1]);
 if(value.startsWith('color-mix')) {
  const primary=parseHex(resolve('cf-primary')),white=parseHex(resolve('cf-surface'));
  return '#'+['r','g','b'].map(k=>Math.round(primary[k]*.9+white[k]*.1).toString(16).padStart(2,'0')).join('');
 }
 if(!/^#[a-f\d]{3,6}$/i.test(value))throw Error('Unsupported color token '+name+': '+value);
 return value;
}
const pairs = [
 ['cf-on-brand','cf-primary'],['cf-on-brand','cf-primary-loading'],
 ['cf-text','cf-surface'],['cf-text','cf-surface-page'],
 ['cf-text-muted','cf-surface'],['cf-text-muted','cf-surface-page'],
 ['cf-brand','cf-surface'],['cf-brand','cf-surface-page'],
 ...['cf-baby-blue','cf-blue-deep','cf-mint','cf-mint-deep'].flatMap(bg=>[['cf-brand',bg],['cf-text',bg]]),
 ['cf-info','cf-info-surface'],['cf-success','cf-success-surface'],
 ['cf-warning','cf-warning-surface'],['cf-danger','cf-danger-surface'],
 ['cf-disabled-ink','cf-disabled-surface'],
 ['cf-input-line','cf-surface',3],['cf-focus','cf-surface',3]
];
const report=pairs.map(([fg,bg,target=4.5])=>{
 const foreground=resolve(fg),background=resolve(bg),ratio=getContrast(foreground,background);
 return {pair:fg+' / '+bg,foreground,background,ratio,target,pass:ratio>=target};
});
for(const p of report)console.log((p.pass?'PASS':'FAIL')+' | '+p.ratio.toFixed(3)+':1 | '+p.pair);
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
console.log('Token pairs only; rendered colors, states and geometry are checked separately in the browser.');
if(report.some(p=>!p.pass))process.exitCode=1;
