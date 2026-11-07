import test from 'node:test';
import assert from 'node:assert/strict';
import {responsiveLayout,networkTarget,responsiveFocus,initialPosition,sphereStyles,focusTarget} from '../dist/scene.mjs';

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
