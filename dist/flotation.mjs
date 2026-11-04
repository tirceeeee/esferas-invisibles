// Fixed 1/60 s steps. Free drift, damped collisions and weak keyword affinities.
// No positional anchors: participants continue wandering throughout the scene.
export function initializeDrift(position,random=Math.random){
 const angle=random()*Math.PI*2;
 return Object.assign(position,{vx:Math.cos(angle)*.04,vy:Math.sin(angle)*.04,flowX:0,flowY:0,aimX:Math.cos(angle),aimY:Math.sin(angle),changeIn:0});
}
export function stepFlotation(nodes,edges,random=Math.random){
 const normalization=20/Math.max(20,nodes.size);
 for(const a of nodes.values()){
  if(--a.changeIn<=0){const angle=random()*Math.PI*2;a.aimX=Math.cos(angle);a.aimY=Math.sin(angle);a.changeIn=600+random()*1200;}
  a.flowX+=(a.aimX-a.flowX)*.003;a.flowY+=(a.aimY-a.flowY)*.003;
  a.vx+=a.flowX*.002;a.vy+=a.flowY*.002;
  // Soft walls reserve room for the header and the lower-left filters.
  if(a.x<180)a.vx+=(180-a.x)*.00025;if(a.x>1400)a.vx-=(a.x-1400)*.00025;
  if(a.y<140)a.vy+=(140-a.y)*.00025;if(a.y>770)a.vy-=(a.y-770)*.00025;
  if(a.x<280&&a.y>570){a.vx+=(280-a.x)*.00018;a.vy-=(a.y-570)*.00005;}
 }
 for(const edge of edges){
  const a=nodes.get(edge.a),b=nodes.get(edge.b);if(!a||!b)continue;
  let dx=b.x-a.x,dy=b.y-a.y;
  if(dx===0&&dy===0){dx=.1;dy=.1;}
  const distance=Math.max(.14,Math.hypot(dx,dy)),personalSpace=(a.radius||15)+(b.radius||15)+55;
  const repel=distance<personalSpace?(personalSpace-distance)*.00035:0;
  // Only shared concepts attract. Long weak springs leave generous open space.
  const affinity=Math.min(8,edge.count)/8,rest=430+(1-affinity)*170;
  const attract=Math.max(0,distance-rest)*affinity*.000004*normalization;
  const force=attract-repel,fx=dx/distance*force,fy=dy/distance*force;
  a.vx+=fx;a.vy+=fy;b.vx-=fx;b.vy-=fy;
 }
 for(const a of nodes.values()){
  a.vx*=.975;a.vy*=.975;const speed=Math.hypot(a.vx,a.vy),limit=.12;
  if(speed>limit){a.vx*=limit/speed;a.vy*=limit/speed;}
  a.x=Math.max(70,Math.min(1450,a.x+a.vx));a.y=Math.max(105,Math.min(800,a.y+a.vy));
 }
}
