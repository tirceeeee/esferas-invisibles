// Coordinates and sprite sizes taken from the two Figma frames, without browser chrome.
export const sphereStyles = {
 silent: {width:127.99,height:85.188,whiteRatio:0},
 boomer: {width:116.255,height:77.368,whiteRatio:.16},
 gen_x: {width:105.539,height:70.245,whiteRatio:.32},
 millennial: {width:111.529,height:74.223,whiteRatio:.55},
 gen_z: {width:47.8,height:31.811,whiteRatio:1},
};
// Original transparent artwork. Align its visible centre, preserving the previous core diameter.
const generationSprites = {
 silent: {file:'silent.png',width:350,height:382,cx:167,cy:167,coreWidth:202},
 boomer: {file:'boomer.png',width:303,height:300,cx:149,cy:156.5,coreWidth:139},
 gen_x: {file:'gen-x.png',width:234,height:233,cx:108.5,cy:117.5,coreWidth:109},
 millennial: {file:'millennial.png',width:190,height:177,cx:96.5,cy:91.5,coreWidth:83},
 gen_z: {file:'gen-z.png',width:116,height:115,cx:59.5,cy:56.5,coreWidth:61},
};
export function spriteAttributes(generation){
 const sprite=generationSprites[generation],scale=sphereStyles[generation].width*.194/sprite.coreWidth;
 return {href:'./assets/generations/'+sprite.file,x:-sprite.cx*scale,y:-sprite.cy*scale,width:sprite.width*scale,height:sprite.height*scale,class:'sphere-art'};
}
export function initialPosition(index,total=20){const angle=index*2.39996,r=Math.sqrt((index+.5)/Math.max(total,index+1));return {x:800+Math.cos(angle)*550*r,y:440+Math.sin(angle)*300*r};}
export function focusTarget(style,mobile=false){return mobile?{x:756,y:730,scale:1100/style.width}:{x:379,y:434,scale:700.227/style.width};}
