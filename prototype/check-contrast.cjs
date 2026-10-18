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

const fs = require('node:fs'),
  path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = [...html.matchAll(/href="\.\/([^"\s]+\.css)"/g)]
  .map((match) => fs.readFileSync(path.join(__dirname, match[1]), 'utf8'))
  .join('\n');
const tokens = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*(#[a-f0-9]{3,6})/gi)].map((m) => [
    m[1],
    m[2],
  ]),
);
const pairs = [
  ['primary', 'surface', 4.5],
  ['subtle', 'surface', 4.5],
  ['ink', 'surface', 4.5],
  ['ink', 'bg', 4.5],
  ['muted', 'surface', 4.5],
  ['muted', 'bg', 4.5],
  ['heading', 'surface', 4.5],
  ['danger', 'danger-soft', 4.5],
  ['success', 'success-soft', 4.5],
  ['warning', 'warning-soft', 4.5],
  ['primary', 'blue-soft', 4.5],
  ['input-border', 'surface', 3],
  ['focus', 'surface', 3],
];
const colorPairs = pairs.map(([fg, bg, target]) => {
  if (!tokens[fg] || !tokens[bg])
    throw new Error('Missing CSS token ' + fg + '/' + bg);
  return { name: fg + ' / ' + bg, fg: tokens[fg], bg: tokens[bg], target };
});
// Check the actual shared v2 token owner, including surfaces used by both roles.
const sharedCSS = require('node:fs').readFileSync(require('node:path').join(__dirname,'../design/tokens.css'),'utf8');
const sharedTokens = Object.fromEntries([...sharedCSS.matchAll(/--(cf-[\w-]+):\s*(#[a-f\d]{3,6})\s*;/gi)].map(m=>[m[1],m[2]]));
for (const [fg,bg,target] of [
  ['cf-on-brand','cf-brand',4.5],['cf-text','cf-surface',4.5],
  ['cf-text-muted','cf-surface',4.5],['cf-text','cf-surface-tonal',4.5],
  ['cf-text-muted','cf-surface-tonal',4.5],['cf-brand','cf-surface-tonal',4.5],
  ['cf-success','cf-success-surface',4.5],['cf-warning','cf-warning-surface',4.5],
  ['cf-danger','cf-danger-surface',4.5],['cf-focus','cf-surface',3],['cf-input-line','cf-surface',3],
]) {
  if(!sharedTokens[fg]||!sharedTokens[bg])throw new Error('Missing shared token '+fg+'/'+bg);
  colorPairs.push({name:fg+' / '+bg,fg:sharedTokens[fg],bg:sharedTokens[bg],target});
}
// Read the winning declaration in stylesheet order. Surfaces can be solid or
// translucent gradients; both need their actual backgrounds checked.
for (const token of ['card-gradient', 'child-gradient', 'selected-gradient']) {
  const declaration = [...css.matchAll(new RegExp('--' + token + ':([^;]+);', 'g'))].at(-1)?.[1].trim();
  if (!declaration) throw new Error('Missing CSS gradient ' + token);
  if (/^#[a-f0-9]{3}(?:[a-f0-9]{3})?$/i.test(declaration)) {
    for (const fg of ['heading', 'muted', 'primary']) {
      colorPairs.push({name: `${fg} / ${token} solid surface`, fg: tokens[fg], bg: declaration, target: 4.5});
    }
    continue;
  }
  const stops = [...declaration.matchAll(/rgba\((\d+),(\d+),(\d+),([.\d]+)\)/g)];
  if (!stops.length) throw new Error('Missing translucent stops for ' + token);
  for (const [index, stop] of stops.entries()) {
    const alpha = Number(stop[4]);
    const bg = '#' + stop.slice(1, 4).map(value =>
      Math.round(Number(value) * alpha + 255 * (1 - alpha)).toString(16).padStart(2, '0'),
    ).join('');
    for (const fg of ['heading', 'muted', 'primary']) {
      colorPairs.push({name: `${fg} / ${token} stop ${index + 1}`, fg: tokens[fg], bg, target: 4.5});
    }
  }
}
colorPairs.push({
  name: 'Video text / stage',
  fg: '#d0e0ee',
  bg: '#0F253D',
  target: 4.5,
});

console.log('=== BÁO CÁO KIỂM TRA ĐỘ TƯƠNG PHẢN MÀU (WCAG 2.1 AA) ===\n');
let allPass = true;

colorPairs.forEach((p) => {
  const ratio = getContrast(p.fg, p.bg);
  const pass = ratio >= p.target;
  if (!pass) allPass = false;
  console.log(
    `${pass ? 'PASS' : 'FAIL'} | Ratio: ${ratio.toFixed(2)}:1 (Mục tiêu >= ${p.target}:1) | ${p.name}`,
  );
});

console.log('\n========================================================');
if (allPass) {
  console.log(
    'KẾT LUẬN: CÁC CẶP TOKEN ĐÃ KIỂM TRA ĐẠT MỤC TIÊU; XEM THÊM AXE RENDERED QA.',
  );
} else {
  console.log('CẢNH BÁO: CÓ CẶP MÀU CHƯA ĐẠT!');
  process.exitCode = 1;
}
