// Reuse numeric buffers; no per-edge DOM mutations, SVG filters or path strings.
const segments=16;
const envelope=Float64Array.from({length:segments+1},(_,i)=>Math.sin(Math.PI*i/segments));
export function createWaveSampler(){
 const sine=new Float64Array(segments+1),cosine=new Float64Array(segments+1);
 return {
  update(clock,profile){
   for(let i=0;i<=segments;i++){
    const u=i/segments,first=u*Math.PI*2*profile.waves-clock,second=u*Math.PI*4+clock*.57;
    sine[i]=(Math.sin(first)+.22*Math.sin(second))*envelope[i]*profile.amplitude;
    cosine[i]=(Math.cos(first)+.22*Math.cos(second))*envelope[i]*profile.amplitude;
   }
  },
  trace(ctx,a,b,phaseSin,phaseCos){
   const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),strength=Math.min(1,length/140);
   const nx=length?-dy/length*strength:0,ny=length?dx/length*strength:0;
   ctx.moveTo(a.x,a.y);
   let px=a.x,py=a.y;
   for(let i=1;i<=segments;i++){
    const u=i/segments,offset=i===segments?0:sine[i]*phaseCos+cosine[i]*phaseSin;
    const x=a.x+dx*u+nx*offset,y=a.y+dy*u+ny*offset;
    if(i>1)ctx.quadraticCurveTo(px,py,(px+x)/2,(py+y)/2);
    px=x;py=y;
   }
   ctx.lineTo(b.x,b.y);
  }
 };
}

export function createConnectionLayer(canvas){
 const ctx=canvas.getContext('2d'),sampler=createWaveSampler();
 let width=0,height=0,ratio=1,scale=1,offsetX=0,offsetY=0;
 return {
  resize(w,h,dpr=1){
   width=w;height=h;ratio=Math.min(2,dpr);
   canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));
   scale=Math.min(w/1512,h/874);offsetX=(w-1512*scale)/2;offsetY=(h-874*scale)/2;
  },
  draw(edges,positions,clock,profile){
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
   if(!width||!height)return;
   ctx.setTransform(ratio*scale,0,0,ratio*scale,ratio*offsetX,ratio*offsetY);
   ctx.strokeStyle='#777772';ctx.lineWidth=.8;ctx.lineCap='round';sampler.update(clock,profile);
   for(const edge of edges){
    ctx.globalAlpha=edge.opacity;ctx.beginPath();
    sampler.trace(ctx,positions.get(edge.a),positions.get(edge.b),edge.phaseSin,edge.phaseCos);ctx.stroke();
   }
   ctx.globalAlpha=1;
  }
 };
}
