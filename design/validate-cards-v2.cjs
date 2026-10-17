/* Card System V2 migration diagnostic.
 * Source lint != rendered contrast/accessibility pass; legacy CSS debt is reported,
 * not hidden, because full migration remains underway.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('design/cards-v2.css');
const get=name=>{
 const m=css.match(new RegExp(name+'\\s*:\\s*([^;]+);'));
 if(!m)throw new Error('Missing token '+name);
 return m[1].trim();
};
const required=[
 '--cf2-font','--cf2-brand','--cf2-surface','--cf2-page','--cf2-text','--cf2-text-soft','--cf2-text-muted',
 '--cf2-surface-tint','--cf2-border','--cf2-radius-card','--cf2-radius-inner','--cf2-card-padding',
 '--cf2-fs-card','--cf2-fs-body','--cf2-fs-caption','--cf2-touch','--cf2-focus'];
for(const token of required)get(token);
const implementation=css.slice(css.indexOf('/* Migration layer'));
if(!implementation)throw new Error('Missing V2 migration layer');
const hex=/#(?:[a-f0-9]{3,4}|[a-f0-9]{6,8})\b/gi;
const hardcoded=(implementation.match(hex)||[]);
if(hardcoded.length)throw new Error('Hardcoded colors in V2 component rules: '+hardcoded.join(','));
function lum(value){
 if(!/^#[0-9a-f]{6}$/i.test(value))throw new Error('Invalid contrast hex '+value);
 const c=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255).map(x=>x<=0.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
 return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
function contrast(a,b){const x=lum(get(a)),y=lum(get(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
const pairs=[
 ['--cf2-text','--cf2-surface'],['--cf2-text-muted','--cf2-surface'],
 ['--cf2-text-soft','--cf2-surface-tint'],['--cf2-brand','--cf2-surface'],
 ['--cf2-on-brand','--cf2-brand'],['--cf2-danger','--cf2-danger-bg'],
 ['--cf2-success','--cf2-success-bg'],['--cf2-warning','--cf2-warning-bg']
];
const checked=pairs.map(([fg,bg])=>({fg,bg,ratio:Number(contrast(fg,bg).toFixed(2))}));
const failed=checked.filter(p=>p.ratio<4.5);
if(failed.length)throw new Error('V2 token contrast below 4.5:1: '+JSON.stringify(failed));
const legacy=[
 'prototype/styles.css','prototype/solid-navy-polish.css','prototype/careflow-rich-content.css','prototype/careflow-experience.css',
 'staff-prototype/styles.css','staff-prototype/doctor-navy-theme.css','staff-prototype/doctor-showcase.css'
];
const debt=legacy.map(file=>({file,hardcodedHex:(read(file).match(hex)||[]).length}));
const summary={status:'TOKEN_SOURCE_VALID',scope:'V2 tokens only; not full rendered WCAG certification',
   cssTokenCount:(css.match(/--cf2-[a-z0-9-]+\s*:/g)||[]).length,
   contrasts:checked,legacyLiteralDebt:debt};
console.log(JSON.stringify(summary,null,2));
