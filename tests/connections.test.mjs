import test from 'node:test';
import assert from 'node:assert/strict';
import {createWaveSampler,createConnectionLayer} from '../dist/connections.mjs';
import {motionProfiles,wavePath,linePhase} from '../dist/motion.mjs';
import {networkFor,demoParticipant} from '../dist/domain.mjs';

test('Canvas conserva la curva anterior y ancla los extremos en todos los perfiles',()=>{
 const sampler=createWaveSampler(),a={x:10,y:20},b={x:400,y:300},phase=1.3;
 for(const profile of Object.values(motionProfiles))for(const clock of [0,2,100]){
  const values=[],ctx={moveTo(...v){values.push(...v);},quadraticCurveTo(...v){values.push(...v);},lineTo(...v){values.push(...v);}};
  sampler.update(clock,profile);sampler.trace(ctx,a,b,Math.sin(phase),Math.cos(phase));
  const expected=wavePath(a,b,phase,clock,profile).match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert.equal(values.length,expected.length);values.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<.006));
  assert.deepEqual(values.slice(-2),[b.x,b.y]);
 }
});

test('la capa dibuja todas las conexiones con su opacidad exacta, incluso sin coincidencias',()=>{
 const alphas=[],ctx={setTransform(){},clearRect(){},beginPath(){},moveTo(){},quadraticCurveTo(){},lineTo(){},stroke(){alphas.push(this.globalAlpha);}};
 const canvas={getContext(){return ctx;}},layer=createConnectionLayer(canvas);
 const keys=Array.from({length:8},(_,i)=>'concepto'+i);
 const people=[8,4,0].map((n,i)=>({id:String(i),periodData:{p80:{keywords:keys.slice(0,n)}}}));
 const edges=networkFor(people).edges.map(e=>({...e,phaseSin:Math.sin(linePhase(e.a,e.b)),phaseCos:Math.cos(linePhase(e.a,e.b))}));
 const positions=new Map(people.map((p,i)=>[p.id,{x:i*50,y:i*20}]));
 layer.resize(1200,700,3);layer.draw(edges,positions,0,motionProfiles.general);
 assert.deepEqual(alphas,[.5,.01,.01]);assert.equal(canvas.width,2400);
});

test('General deduplica conceptos entre décadas y los ejemplos cubren intensidades distintas',()=>{
 const graph=networkFor([{id:'A',periodData:{p80:{keywords:['VHS','cinta VHS']},p90:{keywords:['VHS']}}},{id:'B',periodData:{p00:{keywords:['VHS']}}}]);
 assert.equal(graph.edges[0].count,1);assert.deepEqual(graph.edges[0].keywords,['VHS']);assert.equal(graph.edges[0].opacity,.125);
 const edges=networkFor(Array.from({length:20},(_,i)=>demoParticipant(i))).edges;
 assert.equal(edges.length,190);for(const alpha of [.01,.5,1])assert.ok(edges.some(e=>e.opacity===alpha));
});
