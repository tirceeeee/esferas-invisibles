import test from 'node:test';
import assert from 'node:assert/strict';
import {responsiveLayout,networkTarget,responsiveFocus,initialPosition,sphereStyles,focusTarget,incorporationPose,incorporationDuration,insertionPosition} from '../dist/scene.mjs';

test('la red se adapta al lienzo vertical sin recortar sus anclajes',()=>{
 for(const [width,height] of [[281,300],[351,520],[721,800]]){
  const layout=responsiveLayout(width,height,true);
  assert.ok(Math.abs(layout.height*layout.pixelScale-height)<.001);
  for(let i=0;i<30;i++){
   const node=networkTarget(initialPosition(i,30),layout);
   assert.ok(node.x>0&&node.x<layout.width);
   assert.ok(node.y>0&&node.y<layout.height);
  }
 }
});

test('la esfera de la ficha móvil queda centrada y cabe en su espacio',()=>{
 for(const width of [281,351,721]){
  const layout=responsiveLayout(width,210,true);
  for(const style of Object.values(sphereStyles)){
   const node=responsiveFocus(style,layout);
   assert.equal(node.x,layout.width/2);
   assert.equal(node.y,layout.height/2);
   assert.ok(style.width*.194*node.scale*layout.pixelScale<=120.001);
  }
 }
});

test('la adaptación mantiene las coordenadas de escritorio',()=>{
 const layout=responsiveLayout(1440,900),position=initialPosition(3,12);
 assert.deepEqual(networkTarget(position,layout),{...position,scale:1});
 assert.deepEqual(responsiveFocus(sphereStyles.silent,layout),focusTarget(sphereStyles.silent));
});

test('el zoom conserva las proporciones generacionales en móvil y escritorio',()=>{
 for(const layout of [responsiveLayout(281,210,true),responsiveLayout(721,240,true),responsiveLayout(1440,900)]){
  const styles=Object.values(sphereStyles);
  const diameters=styles.map(style=>style.width*.194*responsiveFocus(style,layout).scale*layout.pixelScale);
  assert.ok(diameters.every((d,i)=>i===0||d<diameters[i-1]));
  for(let i=0;i<styles.length;i++)assert.ok(Math.abs(diameters[i]/diameters[0]-styles[i].width/styles[0].width)<1e-10);
 }
});

test('la incorporación aparece en su destino y reorganiza la red sin alterar los tamaños finales',()=>{
 for(const layout of [responsiveLayout(351,450,true),responsiveLayout(1440,900)]){
  const target=networkTarget(initialPosition(14,15),layout);
  const start=incorporationPose(target,layout,0,true);
  assert.deepEqual(start,{...target,scale:0});
  const appearing=incorporationPose(target,layout,.5,true);
  assert.equal(appearing.x,target.x);assert.equal(appearing.y,target.y);
  assert.ok(appearing.scale>0&&appearing.scale<target.scale);
  for(const isNew of [true,false]){
   const end=incorporationPose(target,layout,incorporationDuration,isNew);
   for(const key of ['x','y','scale'])assert.ok(Math.abs(end[key]-target[key])<1e-9);
  }
  const middle=incorporationPose(target,layout,1.8,false);
  assert.ok(Math.hypot(middle.x-target.x,middle.y-target.y)>10);
  assert.equal(middle.scale,target.scale);
 }
});

test('las nuevas esferas ocupan huecos distintos dentro de la red',()=>{
 const occupied=Array.from({length:14},(_,i)=>initialPosition(i,14));
 const first=insertionPosition(occupied,()=>0);
 const second=insertionPosition([...occupied,first],()=>0);
 assert.ok(Math.hypot(first.x-second.x,first.y-second.y)>50);
 for(const point of [first,second]){
  assert.ok(point.x>=250&&point.x<=1350&&point.y>=140&&point.y<=740);
  assert.ok(Math.min(...occupied.map(p=>Math.hypot(point.x-p.x,point.y-p.y)))>50);
 }
});
