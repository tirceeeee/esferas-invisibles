// Fixed 1/60 s steps. Subtle oscillation around a permanent resting position.
// Offsets stay within 2 world pixels of that position, without accumulated drift.
export function initializeDrift(position,random=Math.random){
 const phase=random()*Math.PI*2;
 return Object.assign(position,{anchorX:position.x,anchorY:position.y,phase,elapsed:0,period:20+random()*12,vx:0,vy:0});
}
export function stepFlotation(nodes){
 for(const a of nodes.values()){
  a.elapsed+=1/60;
  const angle=a.elapsed*Math.PI*2/a.period;
  const x=a.anchorX+.7*(Math.sin(a.phase+angle)-Math.sin(a.phase));
  const y=a.anchorY+.7*(Math.cos(a.phase+angle*.83)-Math.cos(a.phase));
  a.vx=x-a.x;a.vy=y-a.y;a.x=x;a.y=y;
 }
}
