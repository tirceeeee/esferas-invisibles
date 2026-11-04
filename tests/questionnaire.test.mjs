import test from 'node:test';
import assert from 'node:assert/strict';
import {initialParticipants,fictionalParticipants} from '../dist/participants.mjs';
import {interviewParticipants} from '../dist/interviews.mjs';
import {periodQuestions,generalQuestions,participantFromForm} from '../dist/questionnaire.mjs';
import {participantView,networkFor,periodIds,views,opacity} from '../dist/domain.mjs';
import {soundMotion} from '../dist/sound-motion.mjs';

test('ocho entrevistas anónimas y cuatro ejemplos diferenciados con cuatro épocas',()=>{
 assert.equal(interviewParticipants.length,8);assert.equal(fictionalParticipants.length,4);
 assert.equal(new Set(initialParticipants.map(p=>p.id)).size,12);
 assert.equal(interviewParticipants.find(p=>p.id==='R-006').generation,'gen_x');
 for(const p of initialParticipants){
  assert.equal(p.synthetic,p.id.startsWith('D-'));
  for(const field of ['name','birthYear','occupation','email','sourceUrl'])assert.equal(p[field],undefined);
  assert.deepEqual(Object.keys(p.periodData),periodIds);
  for(const id of periodIds){const d=p.periodData[id];assert.ok(d.keywords.every(k=>typeof k==='string'));assert.ok(['directa','parcial','mediada','pendiente'].includes(d.memory));}
 }
 for(const view of views){const g=networkFor(initialParticipants,view.id);assert.equal(g.edges.length,66);for(const edge of g.edges)assert.equal(edge.opacity,opacity(edge.count));}
 assert.deepEqual(participantView(interviewParticipants[3],'p90').capsule,[]);
 assert.match(participantView(interviewParticipants[1],'p00').memoryEvidence,/revisable/);
});

function form(){const f=new FormData();f.set('year','1985');f.set('capsule','Casete; Fotografía');for(let i=0;i<4;i++){f.set('lived'+i,'si');f.set('recall'+i,i<2?'parcial':'claro');f.set('keywords'+i,'VHS, cinta VHS, radio');for(const q of periodQuestions)f.set(q.key+i,q.list?'Elemento A; Elemento B':'Respuesta '+q.key+' '+i);}for(const q of generalQuestions)f.set(q.key,'General '+q.key);return f;}
test('cada respuesta llega a su ficha y permanece aislada por década',()=>{
 const p=participantFromForm(form(),'D-005');assert.equal(p.generation,'millennial');
 for(const [i,id] of periodIds.entries()){
  const d=participantView(p,id);assert.deepEqual(d.keywords,['VHS','radio']);
  for(const q of periodQuestions)assert.deepEqual(d[q.key],q.list?['Elemento A','Elemento B']:'Respuesta '+q.key+' '+i);
 }
 for(const q of generalQuestions)assert.equal(p.general[q.key],'General '+q.key);
 assert.deepEqual(participantView(p).memory,{directa:50,parcial:50,mediada:0});
 assert.deepEqual(participantView(p).capsule,['Casete','Fotografía']);
});
test('valida épocas vividas, memoria mediada y límites de cápsula',()=>{
 const f=form();f.set('year','2001');assert.throws(()=>participantFromForm(f,'D-005'),/anterior/);
 f.set('lived0','no');f.set('lived1','no');assert.equal(participantFromForm(f,'D-005').periodData.p80.memory,'mediada');
 f.set('essential2','A;B;C;D');assert.throws(()=>participantFromForm(f,'D-005'),/tres/);f.set('essential2','A');
 f.set('capsule','A;B;C;D;E;F');assert.throws(()=>participantFromForm(f,'D-005'),/cinco/);
});
test('los filtros mantienen vibraciones distinguibles pero de amplitud leve',()=>{
 for(const t of [0,5,20,100]){const rows=periodIds.map(id=>soundMotion(id,t));
  for(let i=1;i<rows.length;i++){assert.ok(rows[i].frequency>rows[i-1].frequency);assert.ok(rows[i].waves>rows[i-1].waves);}
  for(const p of rows)assert.ok(p.amplitude<=3&&p.frequency<.15);
 }
});
