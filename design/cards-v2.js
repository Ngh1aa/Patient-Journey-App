/* CareFlow shared card v2 presentation contract.
 * Works in patient and doctor browser prototypes; no data writes, routes or medical decisions.
 */
(function(root){
'use strict';
const safe = value => String(value == null ? '' : value)
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#39;');
const states = Object.freeze(['data','empty','loading','error','zero','unread','pressed']);
const variants = Object.freeze(['surface','tinted','hero','outlined','list','banner']);
function ensureState(value) {
  if(!states.includes(value)) throw new Error('Unknown card state: '+value);
  return value;
}
function count(value) {
  const integer = Number(value);
  return Number.isFinite(integer) ? new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(integer) : '—';
}
function dateTime(date,time) {
  if(typeof date!=='string'||! /^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Chưa xác định';
  const value = new Date(date+'T12:00:00+07:00');
  if(Number.isNaN(value.getTime())) return 'Chưa xác định';
  const d = value.getUTCDay();
  const weekday = d===0 ? 'CN' : 'T'+(d+1);
  return weekday+', '+value.toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit'}) +
    (time && /^\d{2}:\d{2}$/.test(time) ? ' · '+time:'');
}
function card(body,{variant='surface',state='data',label='',critical=false}={}){
  if(!variants.includes(variant)) throw new Error('Unknown card variant: '+variant);
  ensureState(state);
  return '<article class="cf2-card" data-cf2-variant="'+variant+
    '" data-cf2-state="'+state+'"'+(label?' aria-label="'+safe(label)+'"':'')+
    (critical?' data-cf2-critical="true"':'')+'>'+body+'</article>';
}
function section(title,content,{id='',linkHtml=''}={}){
  return '<section class="cf2-section"'+(id?' id="'+safe(id)+'"':'')+'><header class="cf2-section-header">'+
    '<h2 class="cf2-section-title">'+safe(title)+'</h2>'+linkHtml+'</header>'+
    '<div class="cf2-section-container">'+content+'</div></section>';
}
function stateView(state,{title='',detail='',retryAction='',retryLabel='Thử lại'}={}){
  ensureState(state);
  if(state==='data'||state==='pressed') return '';
  if(state==='loading')return '<div class="cf2-state" data-cf2-state="loading" role="status" aria-label="Đang tải"><span class="cf2-skeleton" aria-hidden="true"></span></div>';
  const fallback={empty:['Chưa có dữ liệu','Thông tin sẽ xuất hiện khi được cập nhật.'],error:['Không thể tải thông tin','Bạn có thể thử lại.'],zero:['Chưa có mục nào','Thông tin sẽ hiển thị tại đây khi có dữ liệu.'],unread:['Có cập nhật mới','Xem thông tin mới nhất.']};
  const messages=fallback[state];
  return '<div class="cf2-state" data-cf2-state="'+state+'" role="status"><strong>'+
    safe(title||messages[0])+'</strong><p>'+safe(detail||messages[1])+'</p>'+
    (state==='error'&&retryAction?'<button type="button" class="cf2-button" data-action="'+safe(retryAction)+'">'+safe(retryLabel)+'</button>':'')+
    '</div>';
}
function metric(value,label,{detail='',href='',icon=''}={}){
  const zero=Number(value)===0;
  const inside='<span class="cf2-caption">'+safe(label)+'</span><strong class="cf2-metric-value" data-zero="'+zero+'">'+count(value)+'</strong>'+
    (detail?'<span class="cf2-caption">'+safe(detail)+'</span>':'')+
    (icon?'<span class="cf2-metric-icon" aria-hidden="true">'+icon+'</span>':'');
  return href?'<a class="cf2-metric" href="'+safe(href)+'">'+inside+'</a>':'<div class="cf2-metric">'+inside+'</div>';
}
function markSection(section){
  if(!section||section.dataset.cf2Enhanced)return;
  const heading=section.querySelector(':scope > .cf-home-section-head, :scope > .ref-section-heading, :scope > .cf-reference-section-head, :scope > .cfx-section-heading');
  if(!heading)return;
  section.dataset.cf2Enhanced='true';
  section.classList.add('cf2-section');
  heading.classList.add('cf2-section-header');
  const title=heading.querySelector('h2,h3');
  if(title)title.classList.add('cf2-section-title');
  // Existing directly-rendered cards keep their DOM and event wiring. Do not reparent
  // app-specific nodes unless their component already owns one content container.
  const eligible=['.cf-home-card-grid','.cf-home-care-card','.cf-home-support','.cf-home-quick-grid','.ref-overview-grid','.cf-reference-card','.cfx-grid','.cf-collection'];
  const children=[...section.children].filter(child=>child!==heading);
  if(children.length===1&&eligible.some(selector=>children[0].matches(selector))){
    children[0].classList.add('cf2-section-container');
  } else if(section.classList.contains('cfx-section') && children.length){
    // Contextual sections are self-contained by design: exactly one container,
    // retaining delegated data-action controls and their original IDs.
    const wrapper=section.ownerDocument.createElement('div');
    wrapper.className='cf2-section-container';
    heading.after(wrapper);
    for(const node of children) wrapper.appendChild(node);
  }
}
function decoratePatient(rootNode){
  if(!rootNode)return;
  rootNode.querySelectorAll('section.cf-home-task-section,section.cf-home-care-section,section.cf-home-help-section,section.cf-home-tips-section,section.cf-reference-section,section.ref-overview,section.cfx-section').forEach(markSection);
  rootNode.querySelectorAll('.cf-home-appointment-card').forEach(el=>{
    el.dataset.cf2Variant='hero';
    el.dataset.cf2State='data';
  });
}
function decorateDoctor(rootNode){
  if(!rootNode)return;
  rootNode.querySelectorAll('section.doctor-surface').forEach(node=>{
    node.dataset.cf2State=node.querySelector('.doctor-card-empty')?'empty':'data';
    node.dataset.cf2Variant='surface';
  });
  rootNode.querySelectorAll('.doctor-card-heading').forEach(heading=>heading.classList.add('cf2-section-header'));
}
root.CareFlowCardsV2=Object.freeze({safe,count,dateTime,card,section,stateView,metric,decoratePatient,decorateDoctor,states,variants});
})(typeof window!=='undefined'?window:globalThis);
