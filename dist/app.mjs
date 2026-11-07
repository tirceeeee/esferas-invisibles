import {initialParticipants} from './participants.mjs';
import {periodQuestions,generalQuestions,participantFromForm} from './questionnaire.mjs';
import {initializeDrift,stepFlotation} from './flotation.mjs';
import {networkMotion,connectionDensity} from './sound-motion.mjs';
import {createConnectionLayer,createWaveSampler} from './connections.mjs';
import {generations,periods,views,participantView,networkFor} from './domain.mjs';
import {linePhase} from './motion.mjs';
import {sphereStyles,spriteAttributes,initialPosition,responsiveLayout,networkTarget,responsiveFocus} from './scene.mjs';
const $=s=>document.querySelector(s),svgNS='http://www.w3.org/2000/svg';
const menuMedia=matchMedia('(max-width:900px)');
function setMenu(open){$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#site-navigation').hidden=menuMedia.matches&&!open;}
$('#menu-toggle').onclick=()=>setMenu($('#menu-toggle').getAttribute('aria-expanded')!=='true');
$('#site-navigation').addEventListener('click',()=>setMenu(false));
document.addEventListener('click',e=>{if(!e.target.closest('.site-menu'))setMenu(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#menu-toggle').getAttribute('aria-expanded')==='true'){setMenu(false);$('#menu-toggle').focus();}});
menuMedia.addEventListener('change',()=>setMenu(false));setMenu(false);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:900px)');
let sceneLayout=responsiveLayout(innerWidth,innerHeight,mobile.matches);
let participants=structuredClone(initialParticipants),activeView='general',selected=null,paused=reducedMotion.matches,visible=participants,links=[];
let density=0,motion=networkMotion('general',0,0),waveClock=0,flowClock=0,lastFrame=null,accumulator=0;
let frame=null,sceneDirty=true;
const connectionLayer=createConnectionLayer($('#connections'));
const positions=new Map(),nodeElements=new Map(),displayPositions=new Map();
const detailDrift=new Map();
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
  const node=nodeElements.get(p.id),a=positions.get(p.id),display=displayPositions.get(p.id),target=selected===p.id?responsiveFocus(sphereStyles[p.generation],sceneLayout):networkTarget(a,sceneLayout);
  let changed=false;
  for(const key of ['x','y','scale']){const delta=target[key]-display[key];if(Math.abs(delta)>.001){display[key]+=delta*blend;moving=true;changed=true;}else if(delta!==0){display[key]=target[key];changed=true;}}
  if(changed||!node.hasAttribute('transform'))node.setAttribute('transform',`translate(${display.x},${display.y}) scale(${display.scale})`);
  let spriteTransform=`scale(${a.breath})`;
  if(selected===p.id){
   const t=detailDrift.get(p.id)?.elapsed||0;
   // Animate the artwork around its own centre, keeping the enlarged node anchored.
   const breath=Math.sin(t*Math.PI/2.8);
   spriteTransform=`scale(${1+.055*breath})`;
  }
  node.querySelector('.sphere-art').setAttribute('transform',spriteTransform);
  display.radius=sphereStyles[p.generation].width*.097*a.breath*display.scale;
  node.querySelector('.hit-area').setAttribute('r',sceneLayout.compact&&!selected?Math.max(14,22/(sceneLayout.pixelScale*display.scale)):Math.max(14,sphereStyles[p.generation].width*.12));
 }
 if(!selected&&(sceneDirty||moving))connectionLayer.draw(links,displayPositions,waveClock,motion);
 sceneDirty=false;return moving;
}
function wake(){if(frame===null&&!document.hidden)frame=requestAnimationFrame(tick);}
function physicsStep(){
 if(selected){stepFlotation(detailDrift);return;}
 flowClock+=1/60;const target=networkMotion(activeView,flowClock,density);
 for(const key of Object.keys(motion))motion[key]+=(target[key]-motion[key])*.025;
 waveClock+=Math.PI*2*motion.frequency/60;
 stepFlotation(positions,links);
}
function tick(now){
 frame=null;const dt=lastFrame===null?1/60:Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 if(document.hidden){accumulator=0;lastFrame=null;return;}
 const animating=!paused&&!document.querySelector('dialog[open]');
 if(animating){accumulator+=dt;while(accumulator>=1/60){physicsStep();accumulator-=1/60;}sceneDirty=true;}else accumulator=0;
 const transitioning=paint(reducedMotion.matches?1:1-Math.exp(-dt*7));
 if(animating||transitioning)wake();else lastFrame=null;
}
const resizeScene=()=>{const bounds=$('.map-wrap').getBoundingClientRect();sceneLayout=responsiveLayout(bounds.width,bounds.height,mobile.matches);$('#graph').setAttribute('viewBox',`0 0 ${sceneLayout.width} ${sceneLayout.height}`);connectionLayer.resize(bounds.width,bounds.height,devicePixelRatio,sceneLayout.width,sceneLayout.height);sceneDirty=true;paint(1);wake();};
new ResizeObserver(resizeScene).observe($('.map-wrap'));
window.addEventListener('resize',resizeScene);
document.addEventListener('visibilitychange',()=>{lastFrame=null;accumulator=0;if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null;}else{sceneDirty=true;wake();}});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',wake);
function closeDetail(){const previous=selected;selected=null;$('#experience').classList.remove('is-detail');$('#details').hidden=true;$('#back').hidden=true;$('.site-header').inert=false;$('#participant-select').value='';syncSelection();sceneDirty=true;wake();paint(reducedMotion.matches?1:0);nodeElements.get(previous)?.focus({preventScroll:true});}
function showDetail(id,moveFocus=true){
 const p=visible.find(v=>v.id===id);if(!p)return;const opening=selected!==id;
 if(opening){detailDrift.clear();detailDrift.set(id,initializeDrift({x:0,y:0}));}
 selected=id;syncSelection();wake();
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
 const fold=document.createElement('details');fold.className='period-fold';fold.open=i===0;
 fold.append(text('summary',period));
 const row=text('div','','period-row'),field=text('label','¿Qué relación tienes con esta época?'),select=document.createElement('select');select.required=true;select.name='memoryChoice'+i;
 for(const [value,label] of [['','Elige una opción'],['claro','La viví y la recuerdo'],['parcial','La viví y recuerdo fragmentos'],['no','La viví, pero no la recuerdo'],['mediada','No la viví; la conozco por otros']])select.add(new Option(label,value));
 const lived=document.createElement('input'),recall=document.createElement('input');lived.type=recall.type='hidden';lived.name='lived'+i;recall.name='recall'+i;
 select.onchange=()=>{lived.value=select.value==='mediada'?'no':'si';recall.value=select.value==='mediada'?'no':select.value;fold.classList.toggle('answered',!!select.value);};
 field.append(select,lived,recall);row.append(field);
 addQuestion(row,{question:'Tus referentes · hasta 12 keywords',list:false},'keywords'+i);row.querySelector('[name="keywords'+i+'"]').placeholder='Por ejemplo: radio, cine, metro. Separa con comas.';
 addQuestion(row,{question:'¿Qué guardarías de esta década?',list:true},'capsule'+i);
 const extra=document.createElement('details');extra.className='optional-fields';extra.append(text('summary','Añadir recuerdos y matices · opcional'));
 for(const q of periodQuestions.filter(q=>q.key!=='capsule'))addQuestion(extra,q,q.key+i);
 row.append(extra);fold.append(row);$('#period-fields').append(fold);
});
for(const q of generalQuestions)addQuestion($('#general-fields'),q,q.key);
// Reveal invalid controls before native validation tries to focus a closed fold.
$('#add-form').addEventListener('invalid',e=>{let parent=e.target.parentElement;while(parent&&parent!==e.currentTarget){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}},true);
$('#add-form').elements.year.max=new Date().getFullYear();$('#open-add').onclick=()=>$('#add-dialog').showModal();$('#close-add').onclick=()=>$('#add-dialog').close();$('#add-form').onsubmit=e=>{
 e.preventDefault();let p;
 try{p=participantFromForm(new FormData(e.target),'D-'+String(participants.filter(p=>p.synthetic).length+1).padStart(3,'0'));}catch(error){$('#form-error').textContent=error.message;return;}
 participants.push(p);render();if(selected)closeDetail();$('#add-dialog').close();sceneDirty=true;wake();e.target.reset();e.target.querySelectorAll('select').forEach(s=>{s.disabled=false;s.required=true;});$('#form-error').textContent='';$('#announcement').textContent='Memoria '+p.id+' incorporada a la red.';
};
// A white difference-blended dot reads black on white and white on black.
// Each modal needs its own dot because dialogs occupy the browser's top layer.
const pointerMedia=matchMedia('(hover:hover) and (pointer:fine)');
const cursors=[document.body,...document.querySelectorAll('dialog')].map(host=>{const dot=text('span','','negative-cursor');dot.setAttribute('aria-hidden','true');host.append(dot);return dot;});
document.addEventListener('pointermove',e=>{
 if(!pointerMedia.matches||e.pointerType==='touch')return;
 const modal=document.querySelector('dialog[open]'),host=modal||document.body;
 document.documentElement.classList.add('custom-pointer');
 for(const dot of cursors){const active=dot.parentElement===host;dot.hidden=!active;if(active){dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';dot.classList.toggle('over-control',!!e.target.closest('button,a,summary,select,.node,.filter-row'));}}
},{passive:true});
function hidePointer(){document.documentElement.classList.remove('custom-pointer');cursors.forEach(dot=>dot.hidden=true);}
document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hidePointer();});window.addEventListener('blur',hidePointer);pointerMedia.addEventListener('change',hidePointer);cursors.forEach(dot=>dot.hidden=true);
render();resizeScene();wake();
