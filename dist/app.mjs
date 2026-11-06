import {initialParticipants} from './participants.mjs';
import {periodQuestions,generalQuestions,participantFromForm} from './questionnaire.mjs';
import {initializeDrift,stepFlotation} from './flotation.mjs';
import {networkMotion,connectionDensity} from './sound-motion.mjs';
import {createConnectionLayer,createWaveSampler} from './connections.mjs';
import {generations,periods,views,participantView,networkFor} from './domain.mjs';
import {linePhase} from './motion.mjs';
import {sphereStyles,spriteAttributes,initialPosition,focusTarget} from './scene.mjs';
const $=s=>document.querySelector(s),svgNS='http://www.w3.org/2000/svg';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
let participants=structuredClone(initialParticipants),activeView='general',selected=null,paused=reducedMotion.matches,visible=participants,links=[];
let density=0,motion=networkMotion('general',0,0),waveClock=0,flowClock=0,lastFrame=null,accumulator=0;
let frame=null,sceneDirty=true;
const connectionLayer=createConnectionLayer($('#connections'));
const positions=new Map(),nodeElements=new Map(),displayPositions=new Map();
function element(tag,attrs={}){const el=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;}
function gen(p){return generations.find(g=>g.id===p.generation);}
// The guide uses the very same ribbon geometry as the live Canvas network.
function renderHelpConnections(){
 const sampler=createWaveSampler();sampler.update(1.3,networkMotion('general',0,.75));
 const draw=(svg,nodes,edges)=>{
  svg.replaceChildren();
  for(const [from,to,alpha] of edges){
   let d='';const path={moveTo:(x,y)=>d+=`M${x} ${y}`,lineTo:(x,y)=>d+=`L${x} ${y}`,quadraticCurveTo:(x,y,u,v)=>d+=`Q${x} ${y} ${u} ${v}`,closePath:()=>d+='Z'};
   sampler.ribbon(path,nodes[from],nodes[to],Math.sin(.7),Math.cos(.7));
   svg.append(element('path',{d,opacity:alpha}));
  }
  for(const n of nodes){
   const scale=n.radius/(sphereStyles[n.generation].width*.097),group=element('g',{transform:`translate(${n.x},${n.y}) scale(${scale})`});
   group.append(element('image',spriteAttributes(n.generation)));svg.append(group);
  }
 };
 draw($('.help-network'),[{x:55,y:100,radius:22,generation:'silent'},{x:245,y:70,radius:15,generation:'millennial'},{x:170,y:145,radius:8,generation:'gen_z'}],[[0,1,.5],[0,2,.25],[1,2,.75]]);
 document.querySelectorAll('.help-links svg').forEach((svg,i)=>draw(svg,[{x:22,y:30,radius:8,generation:'silent'},{x:198,y:30,radius:7,generation:'millennial'}],[[0,1,[.01,.5,1][i]]]));
}
renderHelpConnections();
const filterNames={p80:'década 80',p90:'década 90',p00:'década 00',p10:'década 10',general:'General'};
[...views.slice(1),views[0]].forEach(view=>{
 const label=text('label','','filter-row'),input=document.createElement('input');
 input.type='radio';input.name='period-view';input.value=view.id;input.checked=view.id===activeView;input.setAttribute('aria-label',view.label+' · '+view.range);
 input.onchange=()=>{activeView=view.id;render();$('#announcement').textContent='Vista '+view.label;};
 label.append(input,text('span',filterNames[view.id]));$('#filters').append(label);
});
function render(){
 visible=participants;$('#count').textContent=visible.filter(p=>!p.synthetic).length+' entrevistas · '+visible.filter(p=>p.synthetic).length+' ejemplos · '+views.find(v=>v.id===activeView).label;$('#empty').hidden=visible.length>0;
 const select=$('#participant-select');select.replaceChildren(new Option('Selecciona una memoria',''));
 for(const [i,p] of visible.entries()){
  select.add(new Option(p.id+' · '+gen(p).label+(p.synthetic?' · Ficticia':' · Entrevista'),p.id));
  if(nodeElements.has(p.id))continue;
  const anchor=initialPosition(i,visible.length);positions.set(p.id,initializeDrift({...anchor,radius:sphereStyles[p.generation].width*.1}));displayPositions.set(p.id,{...anchor,scale:1});
  const style=sphereStyles[p.generation],node=element('g',{class:'node',tabindex:0,role:'button','aria-label':'Abrir '+p.id+', '+gen(p).label});node.dataset.id=p.id;
  node.append(element('image',spriteAttributes(p.generation)));
  node.append(element('circle',{r:Math.max(14,style.width*.12),fill:'transparent',class:'hit-area'}),element('circle',{r:Math.max(16,style.width*.13),class:'focus-ring'}));
  node.addEventListener('click',()=>showDetail(p.id));
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showDetail(p.id);}});
  $('#nodes').append(node);nodeElements.set(p.id,node);
 }
 links=networkFor(visible,activeView).edges.map(edge=>{const phase=linePhase(edge.a,edge.b);return {...edge,phaseSin:Math.sin(phase),phaseCos:Math.cos(phase)};});
 density=connectionDensity(links);
 sceneDirty=true;if(selected)showDetail(selected,false);paint(0);wake();
}
function syncSelection(){
 for(const p of visible){const node=nodeElements.get(p.id),hidden=!!selected&&selected!==p.id;
  node.classList.toggle('selected',selected===p.id);node.style.visibility=hidden?'hidden':'visible';node.setAttribute('tabindex',hidden?'-1':'0');node.setAttribute('aria-hidden',String(hidden));
 }
}
function paint(blend){
 let moving=false;
 for(const p of visible){
  if(selected&&selected!==p.id)continue;
  const node=nodeElements.get(p.id),a=positions.get(p.id),display=displayPositions.get(p.id),target=selected===p.id?focusTarget(sphereStyles[p.generation],mobile.matches):{x:a.x,y:a.y,scale:1};
  let changed=false;
  for(const key of ['x','y','scale']){const delta=target[key]-display[key];if(Math.abs(delta)>.001){display[key]+=delta*blend;moving=true;changed=true;}else if(delta!==0){display[key]=target[key];changed=true;}}
  if(changed||!node.hasAttribute('transform'))node.setAttribute('transform',`translate(${display.x},${display.y}) scale(${display.scale})`);
  node.querySelector('.sphere-art').setAttribute('transform',`scale(${selected===p.id?1:a.breath})`);
  display.radius=sphereStyles[p.generation].width*.097*a.breath*display.scale;
 }
 if(!selected&&(sceneDirty||moving))connectionLayer.draw(links,displayPositions,waveClock,motion);
 sceneDirty=false;return moving;
}
function wake(){if(frame===null&&!document.hidden)frame=requestAnimationFrame(tick);}
function physicsStep(){
 flowClock+=1/60;const target=networkMotion(activeView,flowClock,density);
 for(const key of Object.keys(motion))motion[key]+=(target[key]-motion[key])*.025;
 waveClock+=Math.PI*2*motion.frequency/60;
 stepFlotation(positions,links);
}
function tick(now){
 frame=null;const dt=lastFrame===null?1/60:Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 if(document.hidden){accumulator=0;lastFrame=null;return;}
 const animating=!paused&&!selected&&!document.querySelector('dialog[open]');
 if(animating){accumulator+=dt;while(accumulator>=1/60){physicsStep();accumulator-=1/60;}sceneDirty=true;}else accumulator=0;
 const transitioning=paint(reducedMotion.matches?1:1-Math.exp(-dt*7));
 if(animating||transitioning)wake();else lastFrame=null;
}
const resizeScene=()=>{const bounds=$('.map-wrap').getBoundingClientRect();connectionLayer.resize(bounds.width,bounds.height,devicePixelRatio);sceneDirty=true;wake();};
new ResizeObserver(resizeScene).observe($('.map-wrap'));
window.addEventListener('resize',resizeScene);
document.addEventListener('visibilitychange',()=>{lastFrame=null;accumulator=0;if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null;}else{sceneDirty=true;wake();}});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',wake);
function closeDetail(){const previous=selected;selected=null;$('#experience').classList.remove('is-detail');$('#details').hidden=true;$('#back').hidden=true;$('.site-header').inert=false;$('#participant-select').value='';syncSelection();sceneDirty=true;wake();paint(reducedMotion.matches?1:0);nodeElements.get(previous)?.focus({preventScroll:true});}
function showDetail(id,moveFocus=true){
 const p=visible.find(v=>v.id===id);if(!p)return;const opening=selected!==id;selected=id;syncSelection();wake();
 $('#experience').classList.add('is-detail');$('.site-header').inert=true;$('#back').hidden=false;$('#participant-select').value=id;
 const data=participantView(p,activeView),view=views.find(v=>v.id===activeView),root=$('#details');root.hidden=false;root.replaceChildren();
 const top=text('div','','detail-top'),title=text('h2',p.id);title.id='detail-title';const close=text('button','×');close.setAttribute('aria-label','Volver a la red');close.onclick=closeDetail;top.append(title,close);
 root.append(top,text('p',gen(p).label,'generation-tag'),text('p',(p.synthetic?'Ejemplo ficticio':'Entrevista · síntesis anónima')+' · Madrid','record-origin'),text('p',view.label+' · '+view.range,'view-tag'),text('h3','Referentes culturales · keywords'));
 const chips=text('div','','chips');data.keywords.forEach(k=>chips.append(text('span',k,'chip')));root.append(chips);
 if(!data.keywords.length)root.append(text('p','Sin referentes registrados para este periodo.','muted'));
 const section=(title,value)=>{if(!value||(Array.isArray(value)&&!value.length))return;root.append(text('h3',title));if(Array.isArray(value)){const ul=text('ul','','events');value.forEach(v=>ul.append(text('li',v,'event')));root.append(ul);}else root.append(text('p',value,'capsule'));};
 if(activeView==='general'){
  section('Acontecimientos y cambios sociales',data.events);section('Su cápsula cultural general',data.capsule);
  for(const q of generalQuestions)section(q.title,p.general?.[q.key]);
 }else{
  for(const q of periodQuestions)section(q.title,data[q.key]);
  if(!data.capsule.length)root.append(text('p',data.capsuleNote||'Sin cápsula registrada para este periodo.','muted'));
 }
 const panel=text('section','','memory-section');panel.append(text('h3',activeView==='general'?'Relación memoria estimada':'Memoria · '+view.range));
 if(activeView==='general'&&data.memory){for(const key of ['directa','parcial','mediada']){
  const row=text('div','','memory-row'),bar=text('div','','bar');row.append(text('span','Memoria '+key));
  bar.setAttribute('role','meter');bar.setAttribute('aria-label','Memoria '+key+' estimada');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');bar.setAttribute('aria-valuenow',data.memory[key]);
  const fill=text('span','');fill.style.width=data.memory[key]+'%';bar.append(fill,text('small','≈'+data.memory[key]+'%','bar-value'));row.append(bar);panel.append(row);
 }}else panel.append(text('p',activeView==='general'||data.memory==='pendiente'?'Pendiente de revisión':'Memoria '+data.memory,'period-memory'));
 panel.append(text('p',(activeView==='general'?'Estimación según las respuestas · 25 % por periodo.':'Relación según las respuestas de esta época.')+(p.synthetic?' Ejemplo ficticio.':' Síntesis de entrevista; asociaciones personales, no cronología histórica.'),'memory-note'));if(activeView!=='general'&&data.memoryEvidence)panel.append(text('p',data.memoryEvidence,'memory-note'));root.append(panel);root.setAttribute('aria-labelledby','detail-title');
 if(opening)root.scrollTop=0;if(moveFocus&&opening)$('#back').focus({preventScroll:true});paint(reducedMotion.matches?1:0);
}
$('#back').onclick=closeDetail;$('#home').onclick=e=>{e.preventDefault();if(selected)closeDetail();};
$('#participant-select').onchange=e=>{if(e.target.value){$('#select-dialog').close();showDetail(e.target.value);}else if(selected)closeDetail();};
$('#open-select').onclick=()=>$('#select-dialog').showModal();$('#open-help').onclick=()=>$('#help-dialog').showModal();
for(const button of document.querySelectorAll('[data-close]'))button.onclick=()=>document.getElementById(button.dataset.close).close();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected&&!document.querySelector('dialog[open]'))closeDetail();});
function pauseLabel(){$('#pause').textContent=paused?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Reanudar movimiento':'Pausar movimiento');}$('#pause').onclick=()=>{paused=!paused;pauseLabel();wake();};pauseLabel();
reducedMotion.addEventListener('change',e=>{if(e.matches){paused=true;pauseLabel();paint(1);}});
function addQuestion(container,q,name){
 const label=text('label',q.question,'period-content'),input=document.createElement('textarea');input.name=name;input.rows=2;input.maxLength=1200;if(q.list)input.placeholder='Separa los elementos con punto y coma o en líneas distintas';label.append(input);container.append(label);
}
periods.forEach((period,i)=>{
 const row=document.createElement('fieldset');row.className='period-row';row.append(text('legend',period));
 for(const [key,label,options] of [['lived','¿Viviste esta época?',[['','Selecciona'],['si','Sí'],['no','No']]],['recall','¿Cómo la recuerdas?',[['','Selecciona'],['claro','Con recuerdos propios claros'],['parcial','Con recuerdos propios parciales'],['no','No la recuerdo / no lo sé']]]]){
  const field=text('label',label),select=document.createElement('select');select.name=key+i;select.required=true;options.forEach(([v,l])=>select.add(new Option(l,v)));field.append(select);row.append(field);
 }
 const lived=row.querySelector('[name="lived'+i+'"]'),recall=row.querySelector('[name="recall'+i+'"]');lived.onchange=()=>{recall.disabled=lived.value==='no';recall.required=!recall.disabled;};
 for(const q of periodQuestions)addQuestion(row,q,q.key+i);
 addQuestion(row,{question:'Resume tus referentes en hasta 12 keywords (nombres, objetos o conceptos separados por comas). Son las que compararemos con otras memorias.'},'keywords'+i);
 $('#period-fields').append(row);
});
for(const q of generalQuestions)addQuestion($('#general-fields'),q,q.key);
$('#add-form').elements.year.max=new Date().getFullYear();$('#open-add').onclick=()=>$('#add-dialog').showModal();$('#close-add').onclick=()=>$('#add-dialog').close();$('#add-form').onsubmit=e=>{
 e.preventDefault();let p;
 try{p=participantFromForm(new FormData(e.target),'D-'+String(participants.filter(p=>p.synthetic).length+1).padStart(3,'0'));}catch(error){$('#form-error').textContent=error.message;return;}
 participants.push(p);render();if(selected)closeDetail();$('#add-dialog').close();sceneDirty=true;wake();e.target.reset();e.target.querySelectorAll('select').forEach(s=>{s.disabled=false;s.required=true;});$('#form-error').textContent='';$('#announcement').textContent='Memoria '+p.id+' incorporada a la red.';
};
render();resizeScene();wake();
