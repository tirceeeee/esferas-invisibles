import {generations,periods,generationFor,concepts,classifyAnswer,demoParticipant,periodIds,views,participantView,networkFor} from './domain.mjs';
import {motionProfiles,linePhase,wavePath} from './motion.mjs';
import {sphereStyles,initialPosition,focusTarget} from './scene.mjs';
const $=s=>document.querySelector(s),svgNS='http://www.w3.org/2000/svg';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
let participants=Array.from({length:20},(_,i)=>demoParticipant(i)),activeView='general',selected=null,paused=reducedMotion.matches,visible=participants,links=[],drag=null;
let motion={...motionProfiles.general},waveClock=0,flowClock=0,lastFrame=null,accumulator=0;
const positions=new Map(),nodeElements=new Map(),displayPositions=new Map();
function element(tag,attrs={}){const el=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;}
function gen(p){return generations.find(g=>g.id===p.generation);}
const filterNames={p80:'década 80',p90:'década 90',p00:'década 00',p10:'década 10',general:'General'};
[...views.slice(1),views[0]].forEach(view=>{
 const label=text('label','','filter-row'),input=document.createElement('input');
 input.type='radio';input.name='period-view';input.value=view.id;input.checked=view.id===activeView;input.setAttribute('aria-label',view.label+' · '+view.range);
 input.onchange=()=>{activeView=view.id;render();$('#announcement').textContent='Vista '+view.label;};
 label.append(input,text('span',filterNames[view.id]));$('#filters').append(label);
});
function render(){
 visible=participants;$('#count').textContent=visible.length+' memorias ficticias · '+views.find(v=>v.id===activeView).label;$('#empty').hidden=visible.length>0;
 const select=$('#participant-select');select.replaceChildren(new Option('Selecciona una memoria',''));
 for(const [i,p] of visible.entries()){
  select.add(new Option(p.id+' · '+gen(p).label,p.id));
  if(nodeElements.has(p.id))continue;
  const anchor=initialPosition(i);positions.set(p.id,{...anchor,hx:anchor.x,hy:anchor.y,vx:0,vy:0});displayPositions.set(p.id,{...anchor,scale:1});
  const style=sphereStyles[p.generation],node=element('g',{class:'node',tabindex:0,role:'button','aria-label':'Abrir '+p.id+', '+gen(p).label});node.dataset.id=p.id;
  node.append(element('circle',{r:style.width*.097,fill:'#fff','pointer-events':'none'}));
  node.append(element('image',{href:'./assets/figma/sphere.png',x:-style.width*.54,y:-style.height*.503,width:style.width,height:style.height,class:'sphere-art'}));
  if(style.core)node.append(element('image',{href:'./assets/figma/'+style.core,x:-style.coreSize/2,y:-style.coreSize/2,width:style.coreSize,height:style.coreSize,class:'sphere-core'}));
  node.append(element('circle',{r:Math.max(14,style.width*.12),fill:'transparent',class:'hit-area'}),element('circle',{r:Math.max(16,style.width*.13),class:'focus-ring'}));
  node.addEventListener('click',()=>{if(!node.moved)showDetail(p.id);});
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showDetail(p.id);}});
  node.addEventListener('pointerdown',e=>{if(selected)return;node.moved=false;drag={id:p.id,startX:e.clientX,startY:e.clientY};node.setPointerCapture(e.pointerId);});
  node.addEventListener('pointermove',e=>{if(drag?.id!==p.id)return;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)node.moved=true;
   const point=new DOMPoint(e.clientX,e.clientY).matrixTransform($('#viewport').getScreenCTM().inverse());const a=positions.get(p.id);
   a.x=Math.max(80,Math.min(1430,point.x));a.y=Math.max(110,Math.min(780,point.y));a.hx=a.x;a.hy=a.y;a.vx=a.vy=0;paint(1);
  });
  const release=()=>{if(drag?.id===p.id)drag=null;};node.addEventListener('pointerup',release);node.addEventListener('pointercancel',release);node.addEventListener('lostpointercapture',release);
  $('#nodes').append(node);nodeElements.set(p.id,node);
 }
 $('#edges').replaceChildren();links=networkFor(visible,activeView).edges.map(edge=>{
  const line=element('path',{fill:'none',stroke:'#c3c3bd','stroke-opacity':edge.opacity,'stroke-width':.8});$('#edges').append(line);return {...edge,line,phase:linePhase(edge.a,edge.b)};
 });
 if(selected)showDetail(selected,false);paint(0);
}
function paint(blend){
 for(const l of links){const a=positions.get(l.a),b=positions.get(l.b);l.line.setAttribute('d',wavePath(a,b,l.phase,waveClock,motion));}
 for(const p of visible){
  const node=nodeElements.get(p.id),a=positions.get(p.id),display=displayPositions.get(p.id),target=selected===p.id?focusTarget(sphereStyles[p.generation],mobile.matches):{x:a.x,y:a.y,scale:1};
  for(const key of ['x','y','scale'])display[key]+=(target[key]-display[key])*blend;
  node.setAttribute('transform',`translate(${display.x},${display.y}) scale(${display.scale})`);
  node.classList.toggle('selected',selected===p.id);const hidden=!!selected&&selected!==p.id;
  node.setAttribute('tabindex',hidden?'-1':'0');node.setAttribute('aria-hidden',String(hidden));
 }
}
function physicsStep(){
 const target=motionProfiles[activeView];for(const key of Object.keys(motion))motion[key]+=(target[key]-motion[key])*.025;
 flowClock+=1/60;waveClock+=Math.PI*2*motion.frequency/60;
 if(selected)return;
 for(const p of visible){const a=positions.get(p.id),phase=linePhase(p.id,'flow');
  a.vx+=(a.hx-a.x)*.002+Math.sin(flowClock*.43+a.y*.008+phase)*motion.drift;
  a.vy+=(a.hy-a.y)*.002+Math.cos(flowClock*.36+a.x*.006+phase)*motion.drift*.8;
  if(drag?.id===p.id){a.vx=a.vy=0;continue;}a.vx*=.92;a.vy*=.92;a.x+=a.vx;a.y+=a.vy;
 }
}
function tick(now){
 const dt=lastFrame===null?0:Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 if(!document.hidden){if(!paused){accumulator+=dt;while(accumulator>=1/60){physicsStep();accumulator-=1/60;}}else accumulator=0;
  paint(reducedMotion.matches?1:1-Math.exp(-dt*7));
 }else accumulator=0;requestAnimationFrame(tick);
}
function closeDetail(){const previous=selected;selected=null;$('#experience').classList.remove('is-detail');$('#details').hidden=true;$('#back').hidden=true;$('.site-header').inert=false;$('#participant-select').value='';paint(reducedMotion.matches?1:0);nodeElements.get(previous)?.focus({preventScroll:true});}
function showDetail(id,moveFocus=true){
 const p=visible.find(v=>v.id===id);if(!p)return;const opening=selected!==id;selected=id;drag=null;
 $('#experience').classList.add('is-detail');$('.site-header').inert=true;$('#back').hidden=false;$('#participant-select').value=id;
 const data=participantView(p,activeView),view=views.find(v=>v.id===activeView),root=$('#details');root.hidden=false;root.replaceChildren();
 const top=text('div','','detail-top'),title=text('h2',p.id);title.id='detail-title';const close=text('button','×');close.setAttribute('aria-label','Volver a la red');close.onclick=closeDetail;top.append(title,close);
 root.append(top,text('p',gen(p).label,'generation-tag'),text('p',view.label+' · '+view.range,'view-tag'),text('h3','Referentes culturales'));
 const chips=text('div','','chips');data.keywords.forEach(k=>chips.append(text('span',k,'chip')));root.append(chips);
 if(!data.keywords.length)root.append(text('p','Sin referentes registrados para este periodo.','muted'));
 root.append(text('h3','Acontecimientos y cambios sociales'));const events=text('ul','','events');data.events.forEach(e=>events.append(text('li',e,'event')));root.append(events);
 if(!data.events.length)root.append(text('p','Sin información registrada para este periodo.','muted'));
 root.append(text('h3','Su cápsula cultural'),text('p',data.capsule.length?data.capsule.join(', '):'Sin información registrada para este periodo.','capsule'));
 const panel=text('section','','memory-section');panel.append(text('h3',activeView==='general'?'Relación memoria estimada':'Memoria · '+view.range));
 if(activeView==='general'&&data.memory){for(const key of ['directa','parcial','mediada']){
  const row=text('div','','memory-row'),bar=text('div','','bar');row.append(text('span','Memoria '+key));
  bar.setAttribute('role','meter');bar.setAttribute('aria-label','Memoria '+key+' estimada');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');bar.setAttribute('aria-valuenow',data.memory[key]);
  const fill=text('span','');fill.style.width=data.memory[key]+'%';bar.append(fill,text('small','≈'+data.memory[key]+'%','bar-value'));row.append(bar);panel.append(row);
 }}else panel.append(text('p',activeView==='general'||data.memory==='pendiente'?'Pendiente de revisión':'Memoria '+data.memory,'period-memory'));
 panel.append(text('p',activeView==='general'?'Estimación según las respuestas · 25 % por periodo. Datos ficticios.':'Relación según las respuestas de esta época. Datos ficticios.','memory-note'));root.append(panel);root.setAttribute('aria-labelledby','detail-title');
 if(opening)root.scrollTop=0;if(moveFocus&&opening)$('#back').focus({preventScroll:true});paint(reducedMotion.matches?1:0);
}
$('#back').onclick=closeDetail;$('#home').onclick=e=>{e.preventDefault();if(selected)closeDetail();};
$('#participant-select').onchange=e=>{if(e.target.value){$('#select-dialog').close();showDetail(e.target.value);}else if(selected)closeDetail();};
$('#open-select').onclick=()=>$('#select-dialog').showModal();$('#open-help').onclick=()=>$('#help-dialog').showModal();
for(const button of document.querySelectorAll('[data-close]'))button.onclick=()=>document.getElementById(button.dataset.close).close();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected&&!document.querySelector('dialog[open]'))closeDetail();});
function pauseLabel(){$('#pause').textContent=paused?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Reanudar movimiento':'Pausar movimiento');}$('#pause').onclick=()=>{paused=!paused;pauseLabel();};pauseLabel();
reducedMotion.addEventListener('change',e=>{if(e.matches){paused=true;pauseLabel();paint(1);}});
periods.forEach((period,i)=>{const row=text('div','','period-row');row.append(text('strong',period));const lived=document.createElement('label');lived.append(document.createTextNode('¿La viviste?'));const ls=document.createElement('select');ls.name=`lived${i}`;ls.required=true;[['','Selecciona'],['si','Sí'],['no','No']].forEach(([v,l])=>ls.add(new Option(l,v)));lived.append(ls);const recall=document.createElement('label');recall.append(document.createTextNode('¿Cómo la recuerdas?'));const rs=document.createElement('select');rs.name=`recall${i}`;[['','Selecciona'],['claro','Con recuerdos propios claros'],['parcial','Con recuerdos parciales'],['no','No la recuerdo / no lo sé']].forEach(([v,l])=>rs.add(new Option(l,v)));rs.required=true;ls.onchange=()=>{rs.disabled=ls.value==='no';rs.required=!rs.disabled;};recall.append(rs);row.append(lived,recall);
 for(const [key,title,placeholder] of [['keywords','Referentes de esta época','Conceptos separados por comas'],['events','Acontecimientos de esta época','Acontecimientos separados por punto y coma'],['capsule','Cápsula de esta época','Elementos separados por comas']]){const field=text('label',title,'period-content');const input=document.createElement('input');input.name=key+i;input.maxLength=300;input.placeholder=placeholder;field.append(input);row.append(field);}
 $('#period-fields').append(row);});
$('#add-form').elements.year.max=new Date().getFullYear();$('#open-add').onclick=()=>$('#add-dialog').showModal();$('#close-add').onclick=()=>$('#add-dialog').close();$('#add-form').onsubmit=e=>{
 e.preventDefault();const form=new FormData(e.target),g=generationFor(Number(form.get('year')));
 const split=(name,separator=',')=>String(form.get(name)||'').split(separator).map(x=>x.trim()).filter(Boolean);
 const capsule=split('capsule'),periodData=Object.fromEntries(periodIds.map((id,i)=>[id,{keywords:concepts(split('keywords'+i)),events:split('events'+i,';'),capsule:split('capsule'+i),memory:classifyAnswer(form.get('lived'+i),form.get('recall'+i))}]));
 if(!g||!capsule.length||Object.values(periodData).some(d=>d.keywords.length>12)){$('#form-error').textContent='Comprueba el año, la cápsula general y el máximo de 12 referentes por periodo.';return;}
 const p={id:'R-'+String(participants.length+1).padStart(3,'0'),generation:g.id,periodData,capsule,synthetic:true};participants.push(p);render();showDetail(p.id);$('#add-dialog').close();e.target.reset();e.target.querySelectorAll('select').forEach(s=>{s.disabled=false;s.required=true;});$('#form-error').textContent='';$('#announcement').textContent='Memoria '+p.id+' incorporada a la red.';
};
render();requestAnimationFrame(tick);
