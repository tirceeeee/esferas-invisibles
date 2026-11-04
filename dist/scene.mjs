// Coordinates and sprite sizes taken from the two Figma frames, without browser chrome.
export const sphereStyles = {
 silent: {width:127.99,height:85.188,core:'core-silent.svg',coreSize:24.933},
 boomer: {width:116.255,height:77.368,core:'core-boomer.svg',coreSize:23.155},
 gen_x: {width:105.539,height:70.245,core:'core-x.svg',coreSize:20.559},
 millennial: {width:111.529,height:74.223,core:'core-millennial.svg',coreSize:22.214},
 gen_z: {width:47.8,height:31.811,core:null,coreSize:0},
};
const anchors=[[490,355],[558,350],[694,300],[812,268],[493,148],[535,180],[491,294],[611,316],[667,375],[770,306],[906,334],[954,322],[1088,495],[1034,450],[1020,390],[600,615],[668,608],[802,560],[816,650],[721,644]];
export function initialPosition(index){const point=anchors[index];if(point)return {x:point[0],y:point[1]};const angle=index*2.39996;return {x:780+Math.cos(angle)*230,y:430+Math.sin(angle)*230};}
export function focusTarget(style,mobile=false){return mobile?{x:756,y:730,scale:1100/style.width}:{x:379,y:434,scale:700.227/style.width};}
