import {generations,periods,generationFor,concepts,common,opacity,memory,classifyAnswer,demoParticipant,periodIds,views,participantView,networkFor} from './domain.mjs';
const $=s=>document.querySelector(s),svgNS='http://www.w3.org/2000/svg';
let participants=Array.from({length:20},(_,i)=>demoParticipant(i)),activeView='general',selected=null,zoom=1,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,visible=[],links=[],drag=null;
const positions=new Map(),emptyDetails=$('#details').innerHTML;
function element(tag,attrs={}){const el=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;}
function gen(p){return generations.find(g=>g.id===p.generation);}
views.forEach(view=>{
 const label=text('label','','filter-row');
 const input=document.createElement('input');input.type='radio';input.name='period-view';input.value=view.id;input.checked=view.id===activeView;
 input.addEventListener('change',()=>{activeView=view.id;render();$('#announcement').textContent='Vista '+view.label+'. Se mantienen todos los participantes.';});
 const name=text('span',view.label);name.append(text('small',view.range));label.append(input,name);$('#filters').append(label);
});
function render(){visible=participants;if(selected&&!visible.some(p=>p.id===selected))closeDetail();$('#count').textContent=`${visible.length} memorias · ${views.find(v=>v.id===activeView).label}`;$('#empty').hidden=visible.length>0;$('#edges').replaceChildren();$('#nodes').replaceChildren();links=[];
const select=$('#participant-select');select.replaceChildren(new Option('Selecciona una memoria',''));visible.forEach((p,i)=>{select.add(new Option(`${p.id} · ${gen(p).label}`,p.id));if(!positions.has(p.id)){const angle=i*2.39996;positions.set(p.id,{x:450+Math.cos(angle)*(65+i*7),y:300+Math.sin(angle)*(65+i*6),vx:0,vy:0});}const g=gen(p),node=element('g',{class:'node',tabindex:0,role:'button','aria-label':`Abrir ${p.id}, ${g.label}`});node.dataset.id=p.id;node.append(element('circle',{r:g.radius+6,fill:g.color,opacity:.06}),element('circle',{r:g.radius,fill:g.color,stroke:g.color,'stroke-width':1}));if(g.sprite)node.append(element('image',{href:g.sprite,x:-g.radius,y:-g.radius,width:g.radius*2,height:g.radius*2,'pointer-events':'none'}));const label=element('text',{'text-anchor':'middle',y:g.radius+18});label.textContent=p.id;node.append(label);node.addEventListener('click',()=>{if(!node.moved)showDetail(p.id);});node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showDetail(p.id);}});node.addEventListener('pointerdown',e=>{node.moved=false;drag={id:p.id,startX:e.clientX,startY:e.clientY,node};node.setPointerCapture(e.pointerId);});node.addEventListener('pointermove',e=>{if(drag?.id!==p.id)return;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)node.moved=true;const pt=$('#viewport').getScreenCTM().inverse(),point=new DOMPoint(e.clientX,e.clientY).matrixTransform(pt);Object.assign(positions.get(p.id),{x:Math.max(35,Math.min(865,point.x)),y:Math.max(55,Math.min(540,point.y)),vx:0,vy:0});paint();});node.addEventListener('pointerup',()=>drag=null);node.addEventListener('pointercancel',()=>drag=null);$('#nodes').append(node);});
for(const edge of networkFor(visible,activeView).edges){const line=element('line',{stroke:'#d7c39b','stroke-opacity':edge.opacity,'stroke-width':.65});$('#edges').append(line);links.push({...edge,line});}paint();if(selected)showDetail(selected);}
function paint(){for(const l of links){const a=positions.get(l.a),b=positions.get(l.b);for(const [key,value] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))l.line.setAttribute(key,value);}$('#nodes').querySelectorAll('.node').forEach(n=>{const p=positions.get(n.dataset.id);n.setAttribute('transform',`translate(${p.x},${p.y})`);n.classList.toggle('selected',n.dataset.id===selected);});}
function tick(){if(!paused){for(const p of visible){const a=positions.get(p.id);a.vx+=(450-a.x)*.0009;a.vy+=(285-a.y)*.0009;}for(const l of links){const a=positions.get(l.a),b=positions.get(l.b),dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),repel=850/(d*d),spring=(d-(240-l.count*13))*.00018,force=spring-repel;const fx=dx/d*force,fy=dy/d*force;a.vx+=fx;a.vy+=fy;b.vx-=fx;b.vy-=fy;}for(const p of visible){if(drag?.id===p.id)continue;const a=positions.get(p.id);a.vx*=.86;a.vy*=.86;a.x=Math.max(40,Math.min(860,a.x+a.vx));a.y=Math.max(60,Math.min(525,a.y+a.vy));}paint();}requestAnimationFrame(tick);}
function closeDetail(){selected=null;$('#details').innerHTML=emptyDetails;$('#participant-select').value='';paint();}
function showDetail(id){
 const p=visible.find(v=>v.id===id);if(!p)return;selected=id;$('#participant-select').value=id;
 const data=participantView(p,activeView),view=views.find(v=>v.id===activeView),root=$('#details');root.replaceChildren();
 const info=document.createElement('div'),top=text('div','','detail-top');top.append(text('p','02 / UNA MEMORIA','eyebrow'));
 const close=text('button','×');close.setAttribute('aria-label','Cerrar ficha');close.onclick=closeDetail;top.append(close);
 info.append(top,text('h2',p.id),text('p',gen(p).label,'generation-tag'),text('p',view.label+' · '+view.range,'view-tag'),text('p','Participante ficticio · demostración','small muted'));
 info.append(text('h3','Referentes culturales'));const chips=text('div','','chips');
 data.keywords.forEach(k=>chips.append(text('span',k,'chip')));info.append(chips);
 if(!data.keywords.length)info.append(text('p','Sin referentes registrados para esta vista.','muted'));
 function list(title,values){info.append(text('h3',title));if(!values.length){info.append(text('p','Sin información registrada para este periodo.','muted'));return;}const ul=document.createElement('ul');values.forEach(value=>ul.append(text('li',value)));info.append(ul);}
 list('Acontecimientos y cambios',data.events);list(activeView==='general'?'Su cápsula cultural general':'Su cápsula de esta época',data.capsule);
 const panel=text('section','','memory-section');panel.append(text('h3',activeView==='general'?'Relación de memoria estimada':'Memoria · '+view.range));
 if(activeView==='general'){
  const result=data.memory;
  if(result){for(const key of ['directa','parcial','mediada']){const row=text('div','','bar-label');row.append(text('span','Memoria '+key),text('span','≈'+result[key]+' %'));const bar=text('div','','bar '+key);bar.setAttribute('role','meter');bar.setAttribute('aria-label','Memoria '+key+' estimada');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');bar.setAttribute('aria-valuenow',result[key]);const fill=text('span','');fill.style.width=result[key]+'%';bar.append(fill);panel.append(row,bar);}}
  else panel.append(text('p','Estimación pendiente de revisión: hay respuestas insuficientes o mixtas.','muted'));
  panel.append(text('p','Estimación basada en tus respuestas sobre lo vivido y lo recordado. Cada periodo pesa un 25 %.','small muted'));
  periodIds.forEach((period,i)=>panel.append(text('div',periods[i]+' · '+participantView(p,period).memory,'period-detail')));
 }else{
  panel.append(text('p',data.memory==='pendiente'?'Pendiente de revisión':'Memoria '+data.memory,'period-memory'));
  panel.append(text('p','Relación estimada a partir de las respuestas de este periodo. Selecciona General para ver la distribución de los cuatro periodos.','small muted'));
 }
 root.append(info,panel);paint();
}
$('#participant-select').onchange=e=>e.target.value?showDetail(e.target.value):closeDetail();
function setZoom(value){zoom=Math.max(.6,Math.min(2,value));$('#viewport').setAttribute('transform',`translate(${450*(1-zoom)},${300*(1-zoom)}) scale(${zoom})`);}$('#zoom-in').onclick=()=>setZoom(zoom+.2);$('#zoom-out').onclick=()=>setZoom(zoom-.2);$('#reset').onclick=()=>setZoom(1);$('#graph').addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.1:-.1));},{passive:false});function pauseLabel(){$('#pause').textContent=paused?'▷':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Reanudar movimiento':'Pausar movimiento');}$('#pause').onclick=()=>{paused=!paused;pauseLabel();};pauseLabel();
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
