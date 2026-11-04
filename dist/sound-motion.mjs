// Synthetic sound-inspired envelopes, NOT recordings or historical measurements.
// RMS-like energy -> amplitude; brightness -> wave density; transients -> rhythm.
const profiles={
 p80:{period:9,phase:.3,energy:.38,brightness:.15,pulse:.12},
 p90:{period:6,phase:1.7,energy:.44,brightness:.35,pulse:.23},
 p00:{period:4.5,phase:3.1,energy:.36,brightness:.65,pulse:.35},
 p10:{period:3.5,phase:4.8,energy:.32,brightness:.85,pulse:.42},
};
const bound=x=>Math.max(0,Math.min(1,x));
export function soundFeatures(view,time){
 if(view==='general'){
  const rows=Object.keys(profiles).map(id=>soundFeatures(id,time));
  return {energy:rows.reduce((s,r)=>s+r.energy,0)/4,brightness:rows.reduce((s,r)=>s+r.brightness,0)/4,transient:rows.reduce((s,r)=>s+r.transient,0)/4};
 }
 const p=profiles[view];if(!p)throw new RangeError('Periodo desconocido');
 const slow=Math.sin(time*Math.PI*2/p.period+p.phase),pulse=Math.pow((Math.sin(time*1.7+p.phase)+1)/2,8);
 return {energy:bound(p.energy+.18*slow+p.pulse*pulse),brightness:bound(p.brightness+.08*Math.sin(time*.73+p.phase)),transient:p.pulse*pulse};
}
export function soundMotion(view,time){
 const signal=soundFeatures(view,time);
 return {amplitude:1+signal.energy*3,frequency:.025+signal.brightness*.05+signal.transient*.025,waves:.7+signal.brightness*1.1,drift:.018};
}
