import test from 'node:test';
import assert from 'node:assert/strict';
import {createWaveSampler,createConnectionLayer} from '../dist/connections.mjs';
import {motionProfiles,wavePath,linePhase} from '../dist/motion.mjs';
import {networkFor,demoParticipant} from '../dist/domain.mjs';
import {connectionDensity,networkMotion} from '../dist/sound-motion.mjs';

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
 const alphas=[],ctx={setTransform(){},clearRect(){},beginPath(){},moveTo(){},quadraticCurveTo(){},lineTo(){},closePath(){},fill(){alphas.push(this.globalAlpha);}};
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

test('los embudos se abren en la superficie y se estrechan hacia el centro sin valores inválidos',()=>{
 const sampler=createWaveSampler(),points=[];
 const ctx={moveTo(...p){points.push(p);},lineTo(...p){points.push(p);},quadraticCurveTo(...p){points.push(p);},closePath(){}};
 sampler.update(0,{amplitude:0,waves:1});
 sampler.ribbon(ctx,{x:0,y:0,radius:10},{x:300,y:0,radius:6},0,1);
 assert.ok(Math.abs(points[0][0]-9.2)<1e-9);
 assert.ok(points[0][1]>3);
 const middle=points.filter(p=>p[0]>120&&p[0]<180);
 assert.ok(middle.length>0);assert.ok(middle.every(p=>Math.abs(p[1])<.5));
 assert.ok(points.flat().every(Number.isFinite));
 sampler.ribbon(ctx,{x:0,y:0,radius:10},{x:0,y:0,radius:10},0,1);
 assert.ok(points.flat().every(Number.isFinite));
});

test('la vibración de una línea no depende de sus coincidencias individuales',()=>{
 const render=count=>{
  const ys=[],ctx={setTransform(){},clearRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},quadraticCurveTo(x,y){ys.push(y);},fill(){assert.equal(this.globalAlpha,.5);}};
  const layer=createConnectionLayer({getContext(){return ctx;}});
  layer.resize(1512,874);
  layer.draw([{a:'a',b:'b',count,opacity:.5,phaseSin:0,phaseCos:1}],new Map([['a',{x:0,y:0}],['b',{x:400,y:0}]]),2,{amplitude:2,waves:1.6});
  return Math.max(...ys.map(Math.abs));
 };
 assert.equal(render(8),render(0));
});

test('el porcentaje de coincidencias determina la flexibilidad sin aumentar el ritmo ni acortar las ondas',()=>{
 assert.equal(connectionDensity([]),0);
 assert.equal(connectionDensity([{count:0},{count:1},{count:8},{count:0}]),.5);
 const people=[{id:'a',periodData:{p80:{keywords:['VHS']},p90:{keywords:['radio']}}},{id:'b',periodData:{p80:{keywords:['VHS']},p90:{keywords:['internet']}}}];
 const strong=networkMotion('p80',0,connectionDensity(networkFor(people,'p80').edges));
 const weak=networkMotion('p90',0,connectionDensity(networkFor(people,'p90').edges));
 assert.ok(strong.amplitude>weak.amplitude);assert.equal(strong.frequency,weak.frequency);assert.equal(strong.waves,weak.waves);
 for(const view of ['general','p80','p90','p00','p10']){
  const equal=networkMotion(view,10,.5);
  assert.equal(equal.amplitude,3.1);assert.equal(equal.frequency,.075);assert.equal(equal.waves,.8);
 }
});
