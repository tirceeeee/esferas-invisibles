// Reuse numeric buffers; no per-edge DOM mutations, SVG filters or path strings.
const segments=32;
const envelope=Float64Array.from({length:segments+1},(_,i)=>Math.sin(Math.PI*i/segments));
export function createWaveSampler(){
 const sine=new Float64Array(segments+1),cosine=new Float64Array(segments+1);
 const xs=new Float64Array(segments+1),ys=new Float64Array(segments+1),widths=new Float64Array(segments+1);
 return {
  update(clock,profile){
   for(let i=0;i<=segments;i++){
    const u=i/segments,first=u*Math.PI*2*profile.waves-clock;
    sine[i]=Math.sin(first)*envelope[i]*profile.amplitude;
    cosine[i]=Math.cos(first)*envelope[i]*profile.amplitude;
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
  },
  ribbon(ctx,a,b,phaseSin,phaseCos){
   const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
   if(length<.001)return;
   const ux=dx/length,uy=dy/length,nx=-uy,ny=ux;
   const ra=Math.min(a.radius||0,length*.2),rb=Math.min(b.radius||0,length*.2);
   const start=ra*.92,end=length-rb*.92,span=end-start,strength=Math.min(1,span/140);
   for(let i=0;i<=segments;i++){
    const u=i/segments,d=start+span*u,offset=(i===0||i===segments)?0:(sine[i]*phaseCos+cosine[i]*phaseSin)*strength;
    xs[i]=a.x+ux*d+nx*offset;ys[i]=a.y+uy*d+ny*offset;
    // Broad at the sphere surface, tapering smoothly into the thin filament.
    widths[i]=.4+ra*.34*Math.exp(-span*u/Math.max(6,ra*1.1))+rb*.34*Math.exp(-span*(1-u)/Math.max(6,rb*1.1));
   }
   ctx.moveTo(xs[0]+nx*widths[0],ys[0]+ny*widths[0]);
   for(let side=1;side>=-1;side-=2){
    for(let j=1;j<=segments;j++){
     const i=side===1?j:segments-j,prev=side===1?i-1:i+1;
     const px=xs[prev]+nx*widths[prev]*side,py=ys[prev]+ny*widths[prev]*side;
     const x=xs[i]+nx*widths[i]*side,y=ys[i]+ny*widths[i]*side;
     ctx.quadraticCurveTo(px,py,(px+x)/2,(py+y)/2);
    }
    const i=side===1?segments:0;
    ctx.lineTo(xs[i]+nx*widths[i]*side,ys[i]+ny*widths[i]*side);
    if(side===1)ctx.lineTo(xs[i]-nx*widths[i],ys[i]-ny*widths[i]);
   }
   ctx.closePath();
  }
 };
}

export function createConnectionLayer(canvas){
 const ctx=canvas.getContext('2d'),sampler=createWaveSampler();
 let width=0,height=0,ratio=1,scale=1,offsetX=0,offsetY=0;
 return {
  resize(w,h,dpr=1,viewWidth=1512,viewHeight=874){
   width=w;height=h;ratio=2; // Supersample even on 1x screens to prevent thin-edge shimmer.
   canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));
   scale=Math.min(w/viewWidth,h/viewHeight);offsetX=(w-viewWidth*scale)/2;offsetY=(h-viewHeight*scale)/2;
  },
  draw(edges,positions,clock,profile){
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
   if(!width||!height)return;
   ctx.setTransform(ratio*scale,0,0,ratio*scale,ratio*offsetX,ratio*offsetY);
   ctx.fillStyle='#171717';
   sampler.update(clock,profile);
   for(const edge of edges){
    ctx.globalAlpha=edge.opacity;ctx.beginPath();
    sampler.ribbon(ctx,positions.get(edge.a),positions.get(edge.b),edge.phaseSin,edge.phaseCos);ctx.fill();
   }
   ctx.globalAlpha=1;
  }
 };
}
