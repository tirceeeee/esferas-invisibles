// Progressive generation sizes, from oldest to youngest.
export const sphereStyles = {
 silent: {width:140,height:93.18,whiteRatio:0},
 boomer: {width:124,height:82.53,whiteRatio:.16},
 gen_x: {width:108,height:71.88,whiteRatio:.32},
 millennial: {width:92,height:61.23,whiteRatio:.55},
 gen_z: {width:76,height:50.58,whiteRatio:1},
};
// Original transparent artwork. Align its visible centre, preserving the previous core diameter.
const generationSprites = {
 silent: {file:'silent.png',width:348,height:385,cx:172,cy:171,coreWidth:202},
 boomer: {file:'boomer.png',width:302,height:295,cx:147,cy:144.5,coreWidth:139},
 gen_x: {file:'gen-x.png',width:241,height:234,cx:112.5,cy:116.5,coreWidth:109},
 millennial: {file:'millennial.png',width:176,height:176,cx:84.5,cy:89.5,coreWidth:83},
 gen_z: {file:'gen-z.png',width:116,height:110,cx:58.5,cy:51.5,coreWidth:61},
};
export function spriteAttributes(generation){
 const sprite=generationSprites[generation],scale=sphereStyles[generation].width*.194/sprite.coreWidth;
 return {href:'./assets/generations/'+sprite.file,x:-sprite.cx*scale,y:-sprite.cy*scale,width:sprite.width*scale,height:sprite.height*scale,class:'sphere-art'};
}
export function initialPosition(index,total=20){const angle=index*2.39996,r=Math.sqrt((index+.5)/Math.max(total,index+1));return {x:800+Math.cos(angle)*550*r,y:440+Math.sin(angle)*300*r};}
// One zoom factor for all generations: preserve their original size hierarchy.
export function focusTarget(style,mobile=false){return mobile?{x:756,y:730,scale:1100/sphereStyles.silent.width}:{x:379,y:434,scale:700.227/sphereStyles.silent.width};}
export function responsiveLayout(width,height,compact=false){
 const viewHeight=compact?1512*Math.max(1,height)/Math.max(1,width):874;
 return {compact,width:1512,height:viewHeight,pixelScale:Math.min(width/1512,height/viewHeight)};
}
export function networkTarget(position,layout){
 if(!layout.compact)return {x:position.x,y:position.y,scale:1};
 return {x:756+(position.x-800)*.98,y:layout.height/2+(position.y-440)*layout.height/760,scale:Math.min(2.8,Math.max(1.2,.6/layout.pixelScale))};
}
export function responsiveFocus(style,layout){
 if(!layout.compact)return focusTarget(style);
 return {x:756,y:layout.height/2,scale:Math.min(120,layout.pixelScale*1512*.28)/(sphereStyles.silent.width*.194*layout.pixelScale)};
}

export const incorporationDuration=3.6;
// Pick one of the roomiest areas, rather than always spawning at the same point.
export function insertionPosition(occupied,random=Math.random){
 const candidates=Array.from({length:64},(_,i)=>{
  const point=initialPosition(i,64);
  const clearance=occupied.length?Math.min(...occupied.map(p=>Math.hypot(point.x-p.x,point.y-p.y))):1;
  return {...point,clearance};
 }).sort((a,b)=>b.clearance-a.clearance);
 const roomy=candidates.filter(p=>p.clearance>=candidates[0].clearance*.85).slice(0,8);
 const chosen=roomy[Math.min(roomy.length-1,Math.floor(random()*roomy.length))];
 return {x:chosen.x,y:chosen.y};
}
export function incorporationPose(target,layout,elapsed,isNew,origin={x:layout.width/2,y:layout.height/2}){
 const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 if(isNew){
  return {...target,scale:target.scale*ease(elapsed/.9)};
 }
 const dx=target.x-origin.x,dy=target.y-origin.y,distance=Math.max(1,Math.hypot(dx,dy));
 const wave=Math.sin(Math.PI*ease(elapsed/incorporationDuration))*55*Math.exp(-distance/1000);
 return {...target,x:target.x+dx/distance*wave,y:target.y+dy/distance*wave};
}
