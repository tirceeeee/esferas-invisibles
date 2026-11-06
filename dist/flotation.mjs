// Fixed 1/60 s steps. Subtle oscillation around a permanent resting position.
// Offsets stay within 28 world pixels of that position, without accumulated drift.
export function initializeDrift(position,random=Math.random){
 const phase=random()*Math.PI*2;
 const seed=Math.floor(random()*1000000),period=3+random()*2;
 return Object.assign(position,{anchorX:position.x,anchorY:position.y,phase,seed,elapsed:0,period,originX:noise(0,seed),originY:noise(0,seed+7919),breath:1,vx:0,vy:0});
}
// Smooth seeded random destinations: no jitter, repeated orbit or accumulated travel.
function noise(time,seed){
 const i=Math.floor(time),t=time-i,s=t*t*t*(t*(t*6-15)+10);
 const value=k=>{let n=Math.imul(k+seed,374761393);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295*2-1;};
 return value(i)*(1-s)+value(i+1)*s;
}
export function stepFlotation(nodes){
 for(const a of nodes.values()){
  a.elapsed+=1/60;
  const time=a.elapsed/a.period;
  const x=a.anchorX+9.828*(noise(time,a.seed)-a.originX);
  const y=a.anchorY+9.828*(noise(time*.83,a.seed+7919)-a.originY);
  a.breath=1+.018*Math.sin(a.phase+a.elapsed*.9)+.007*Math.sin(a.phase*1.7+a.elapsed*.57);
  a.vx=x-a.x;a.vy=y-a.y;a.x=x;a.y=y;
 }
}
