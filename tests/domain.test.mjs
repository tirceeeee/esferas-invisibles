import test from 'node:test';import assert from 'node:assert/strict';
import {generationFor,common,opacity,memory,classifyAnswer,participantView,networkFor,demoParticipant,periodIds,views} from '../dist/domain.mjs';
test('fronteras generacionales y años inválidos',()=>{for(const [y,id] of [[1928,'silent'],[1945,'silent'],[1946,'boomer'],[1964,'boomer'],[1965,'gen_x'],[1967,'gen_x'],[1980,'gen_x'],[1981,'millennial'],[1996,'millennial'],[1997,'gen_z']])assert.equal(generationFor(y,2026)?.id,id);for(const y of [1927,2027,1990.5,NaN])assert.equal(generationFor(y,2026),null);});
test('conceptos únicos y comparación simétrica',()=>{const a=['móvil','teléfono móvil','VHS','cinta VHS'],b=['telefono movil','vhs'];assert.equal(common(a,b).length,2);assert.deepEqual(common(a,b).sort(),common(b,a).sort());assert.equal(common(['Jackson'],['Michael Jackson']).length,0);});
test('cero coincidencias mantiene conexión y saturación en ocho',()=>{assert.equal(opacity(0),.01);assert.equal(opacity(4),.5);assert.equal(opacity(8),1);assert.equal(opacity(12),1);});
test('memoria respeta respuestas, suma 100 y no inventa datos',()=>{assert.deepEqual(memory(['mediada','parcial','directa','directa']),{directa:50,parcial:25,mediada:25});assert.equal(memory(['directa','directa','directa','pendiente']),null);assert.equal(memory(['directa']),null);assert.equal(classifyAnswer('no',''),'mediada');assert.equal(classifyAnswer('si','parcial'),'parcial');assert.equal(classifyAnswer('si','no'),'pendiente');assert.equal(classifyAnswer('si','claro'),'directa');});
test('cada década aísla sus datos y General conserva la cápsula final',()=>{
 const p={id:'A',capsule:['cápsula final'],periodData:{p80:{keywords:['VHS'],events:['evento 80'],capsule:['cinta'],memory:'mediada'},p90:{keywords:['CD'],events:['evento 90'],capsule:['disco'],memory:'parcial'},p00:{keywords:['VHS'],memory:'directa'},p10:{memory:'directa'}}};
 assert.deepEqual(participantView(p,'p80'),{keywords:['VHS'],events:['evento 80'],capsule:['cinta'],memory:'mediada'});
 const general=participantView(p);assert.deepEqual(general.keywords,['VHS','cd']);assert.deepEqual(general.capsule,['cápsula final']);assert.deepEqual(general.memory,{directa:50,parcial:25,mediada:25});
 assert.deepEqual(participantView(p,'p90').events,['evento 90']);assert.throws(()=>participantView(p,'p20'),RangeError);
});
test('la red mantiene todas las bolitas y conexiones, cambiando solo las coincidencias del periodo',()=>{
 const people=[{id:'A',periodData:{p80:{keywords:['VHS']},p90:{keywords:['CD']}}},{id:'B',periodData:{p80:{keywords:['radio']},p90:{keywords:['CD']}}},{id:'C',periodData:{}}];
 for(const view of views){const graph=networkFor(people,view.id);assert.deepEqual(graph.nodes.map(n=>n.id),['A','B','C']);assert.equal(graph.edges.length,3);assert.ok(graph.edges.every(e=>e.opacity>=.01));}
 assert.equal(networkFor(people,'p80').edges[0].count,0);assert.equal(networkFor(people,'p90').edges[0].count,1);
 assert.deepEqual(participantView(people[2],'p80'),{keywords:[],events:[],capsule:[],memory:'pendiente'});
});
test('los datos de demostración tienen cuatro épocas diferenciadas y memoria coherente',()=>{
 const p=demoParticipant(4);assert.deepEqual(Object.keys(p.periodData),periodIds);assert.notDeepEqual(participantView(p,'p80').keywords,participantView(p,'p10').keywords);assert.deepEqual(participantView(p).memory,{directa:25,parcial:25,mediada:50});
});

test('cada década muestra opacidades mínimas, medias y máximas con sus propias keywords',()=>{
 const people=Array.from({length:20},(_,i)=>demoParticipant(i));
 for(const view of views){
  const {edges}=networkFor(people,view.id);
  for(const value of [.01,.5,1])assert.ok(edges.some(e=>e.opacity===value),view.id+' '+value);
  for(const edge of edges){
   const a=people.find(p=>p.id===edge.a),b=people.find(p=>p.id===edge.b);
   const expected=common(participantView(a,view.id).keywords,participantView(b,view.id).keywords);
   assert.deepEqual(edge.keywords,expected);assert.equal(edge.opacity,opacity(expected.length));
  }
 }
 assert.notDeepEqual(networkFor(people,'p80').edges.map(e=>e.opacity),networkFor(people,'p90').edges.map(e=>e.opacity));
});
