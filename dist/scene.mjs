// Coordinates and sprite sizes taken from the two Figma frames, without browser chrome.
export const sphereStyles = {
 silent: {width:127.99,height:85.188,whiteRatio:0},
 boomer: {width:116.255,height:77.368,whiteRatio:.16},
 gen_x: {width:105.539,height:70.245,whiteRatio:.32},
 millennial: {width:111.529,height:74.223,whiteRatio:.55},
 gen_z: {width:47.8,height:31.811,whiteRatio:1},
};
export function initialPosition(index,total=20){const angle=index*2.39996,r=Math.sqrt((index+.5)/Math.max(total,index+1));return {x:800+Math.cos(angle)*550*r,y:440+Math.sin(angle)*300*r};}
export function focusTarget(style,mobile=false){return mobile?{x:756,y:730,scale:1100/style.width}:{x:379,y:434,scale:700.227/style.width};}
