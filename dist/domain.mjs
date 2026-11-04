export const generations=[
 {id:'silent',label:'Silenciosa',range:'1928–1945',min:1928,max:1945,color:'#e8c3a4',radius:22,sprite:null},
 {id:'boomer',label:'Baby Boomers',range:'1946–1964',min:1946,max:1964,color:'#d6a855',radius:19,sprite:null},
 {id:'gen_x',label:'Generación X',range:'1965–1980',min:1965,max:1980,color:'#bc7860',radius:16,sprite:null},
 {id:'millennial',label:'Millennials',range:'1981–1996',min:1981,max:1996,color:'#9fad86',radius:13,sprite:null},
 {id:'gen_z',label:'Generación Z',range:'Desde 1997',min:1997,max:Infinity,color:'#a09ac2',radius:10,sprite:null}
];
export const periods=['1980–1989','1990–1999','2000–2009','2010–2020'];
export function generationFor(year,currentYear=new Date().getFullYear()){if(!Number.isInteger(year)||year>currentYear) return null;return generations.find(g=>year>=g.min&&year<=g.max)||null;}
const aliases=new Map([['movil','teléfono móvil'],['telefono movil','teléfono móvil'],['cinta vhs','VHS'],['vhs','VHS'],['cassette','casete'],['casetes','casete'],['rrss','redes sociales']]);
export function normalize(value){return value.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');}
export function concepts(values){return [...new Set(values.filter(v=>v.trim()).map(v=>aliases.get(normalize(v))||normalize(v)))];}
export function common(a,b){const right=new Set(concepts(b));return concepts(a).filter(v=>right.has(v));}
export function opacity(count){return Math.max(.01,Math.min(count/8,1));}
export function memory(answers){const counts={directa:0,parcial:0,mediada:0};if(answers.length!==4||answers.some(v=>!Object.hasOwn(counts,v)))return null;answers.forEach(v=>counts[v]+=25);return counts;}
export function classifyAnswer(lived,recall){if(lived==='no')return 'mediada';if(lived!=='si')return 'pendiente';if(recall==='claro')return 'directa';if(recall==='parcial')return 'parcial';return 'pendiente';}
const packs=[['VHS','casete','radio','Michael Jackson','cine','vinilo','televisión','walkman'],['teléfono móvil','internet','radio','cine','fotografía','ordenador','televisión','VHS'],['internet','redes sociales','videojuegos','teléfono móvil','streaming','fotografía','cine','música']];
export function demoParticipant(index){const g=generations[index%5],p=concepts(packs[index%3]);return {id:`R-${String(index+1).padStart(3,'0')}`,generation:g.id,keywords:p,events:['Llegada de internet a casa','Transformación de las formas de comunicarnos'],capsule:p.slice(0,5),answers:g.id==='millennial'?['mediada','parcial','directa','directa']:g.id==='gen_z'?['mediada','mediada','parcial','directa']:['directa','directa','directa','directa'],synthetic:true};}
