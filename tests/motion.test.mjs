import test from 'node:test';
import assert from 'node:assert/strict';
import {motionProfiles, linePhase, wavePath} from '../dist/motion.mjs';

test('las ondas conservan extremos y geometría válida incluso al superponer nodos', () => {
 for (const profile of Object.values(motionProfiles)) {
  for (const b of [{x:400,y:300},{x:10,y:20}]) {
   for (const time of [0,1,10000]) {
    const path=wavePath({x:10,y:20},b,1,time,profile);
    assert.ok(path.startsWith('M 10 20'));
    assert.ok(path.endsWith(`L ${b.x} ${b.y}`));
    assert.doesNotMatch(path,/NaN|Infinity/);
   }
  }
 }
});

test('el tiempo y el periodo cambian la curva sin alterar la fase estable de la pareja', () => {
 const a={x:0,y:0},b={x:300,y:200},phase=linePhase('R-001','R-002');
 assert.equal(phase,linePhase('R-002','R-001'));
 const paths=Object.values(motionProfiles).map(p=>wavePath(a,b,phase,0,p));
 assert.equal(new Set(paths).size,5);
 assert.notEqual(paths[0],wavePath(a,b,phase,1,motionProfiles.general));
});
