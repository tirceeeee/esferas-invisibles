import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeDrift,stepFlotation} from '../dist/flotation.mjs';
import {initialPosition,sphereStyles} from '../dist/scene.mjs';
import {soundFeatures,soundMotion} from '../dist/sound-motion.mjs';
import {demoParticipant,networkFor} from '../dist/domain.mjs';
function seeded(){let s=123;return ()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296);}
test('formas por generación respetan la progresión negra a blanca y mantienen tamaños',()=>{
 assert.deepEqual(Object.values(sphereStyles).map(s=>s.whiteRatio),[0,.16,.32,.55,1]);
 assert.equal(sphereStyles.silent.width,127.99);assert.equal(sphereStyles.gen_z.width,47.8);
});
test('la flotación recorre espacio sin anclajes, tiene velocidad acotada y permanece dentro del lienzo',()=>{
 const random=seeded(),people=Array.from({length:20},(_,i)=>demoParticipant(i)),edges=networkFor(people).edges;
 const nodes=new Map(people.map((p,i)=>[p.id,initializeDrift(initialPosition(i),random)]));
 const original=[...nodes.values()].map(p=>({...p}));let maxTravel=0;
 for(let t=0;t<3600;t++){
  stepFlotation(nodes,edges,random);
  [...nodes.values()].forEach((p,i)=>{assert.ok(Number.isFinite(p.x+p.y));assert.ok(p.x>=70&&p.x<=1450&&p.y>=105&&p.y<=800);assert.ok(Math.hypot(p.vx,p.vy)<=.70001);maxTravel=Math.max(maxTravel,Math.hypot(p.x-original[i].x,p.y-original[i].y));});
 }
 assert.ok(maxTravel>100);
 assert.ok(Math.max(...original.map(p=>p.x))-Math.min(...original.map(p=>p.x))>900);
});
test('añadir un participante reequilibra las fuerzas de la red sin teletransportar los existentes',()=>{
 const random=seeded(),people=[demoParticipant(0),demoParticipant(1)],edges=networkFor(people).edges;
 const nodes=new Map([[people[0].id,initializeDrift({x:500,y:400},random)]]);
 const before={...nodes.get(people[0].id)};
 nodes.set(people[1].id,initializeDrift({x:500,y:400},random));
 stepFlotation(nodes,edges,random);
 const a=nodes.get(people[0].id),b=nodes.get(people[1].id);
 assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>0);assert.ok(Math.hypot(a.x-before.x,a.y-before.y)<=.71);
});
test('ondas sintéticas por década evolucionan y General mezcla las cuatro señales',()=>{
 const ids=['p80','p90','p00','p10'];
 for(const t of [0,10,50,1000]){
  const rows=ids.map(id=>soundFeatures(id,t)),general=soundFeatures('general',t);
  for(const key of ['energy','brightness','transient'])assert.ok(Math.abs(general[key]-rows.reduce((s,r)=>s+r[key],0)/4)<1e-12);
  for(const id of [...ids,'general']){const p=soundMotion(id,t);assert.ok(p.amplitude>=5&&p.amplitude<=24);assert.ok(p.frequency>0&&p.frequency<.5);}
 }
 assert.equal(new Set(ids.map(id=>JSON.stringify(soundMotion(id,0)))).size,4);
 assert.notDeepEqual(soundMotion('p80',0),soundMotion('p80',10));
});
