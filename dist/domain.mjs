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
export const periodIds=['p80','p90','p00','p10'];
export const views=[{id:'general',label:'General',range:'Todos los periodos'},...periodIds.map((id,i)=>({id,label:['Años 80','Años 90','Años 2000','Años 2010'][i],range:periods[i]}))];
export function participantView(participant,view='general') {
 if(!views.some(v=>v.id===view))throw new RangeError('Periodo desconocido');
 const records=participant.periodData||{};
 if(view!=='general') { const data=records[view];return {keywords:data?.keywords||[],events:data?.events||[],capsule:data?.capsule||[],memory:data?.memory||'pendiente'}; }
 const rows=periodIds.map(id=>records[id]);
 return {keywords:concepts(rows.flatMap(r=>r?.keywords||[])),events:[...new Set(rows.flatMap(r=>r?.events||[]))],capsule:participant.capsule||[],memory:memory(rows.map(r=>r?.memory||'pendiente'))};
}
export function networkFor(participants,view='general') {
 const nodes=participants.map(p=>({id:p.id,data:participantView(p,view)})),edges=[];
 const sets=nodes.map(n=>new Set(concepts(n.data.keywords)));
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const keywords=[...sets[i]].filter(k=>sets[j].has(k));edges.push({a:nodes[i].id,b:nodes[j].id,keywords,count:keywords.length,opacity:opacity(keywords.length)});}
 return {nodes,edges};
}
const decadePacks=[
 ['VHS','casete','radio','Michael Jackson','cine','vinilo','televisión','walkman'],
 ['CD','internet','radio','Nirvana','fotografía','ordenador','televisión','teléfono móvil'],
 ['DVD','internet','videojuegos','teléfono móvil','Tuenti','cámara digital','MP3','blogs'],
 ['streaming','redes sociales','videojuegos','smartphone','Netflix','fotografía','podcasts','Spotify']
];
const decadeEvents=[['La caída del Muro de Berlín','La movida madrileña'],['Internet empieza a llegar a los hogares','Nuevas formas de comunicación móvil'],['La expansión de las redes sociales','La fotografía se vuelve digital'],['La vida cotidiana conectada','El confinamiento de 2020']];
// Deliberately varied fictional records: isolated tastes, partial matches and close peers.
function demoKeywords(index,period){
 // Include strong and medium matches in every decade, not only in General.
 if(index%20>=16){const count=[8,8,4,0][index%20-16];return decadePacks[period].slice(0,count);}
 index=(index+period*3)%16;
 const pack=decadePacks[period],group=Math.floor(index/4),member=index%4;
 const choices=[[0,1,2],[3,4,5],[5,6,7],[1,4,7],[0,3,6]][group%5];
 const count=member===0?3:member===1?2:1;
 return choices.slice(0,count).map(j=>pack[j]);
}
export function demoParticipant(index){
 const g=generations[index%5],answers=g.id==='millennial'?['mediada','parcial','directa','directa']:g.id==='gen_z'?['mediada','mediada','parcial','directa']:['directa','directa','directa','directa'];
 const periodData=Object.fromEntries(periodIds.map((id,i)=>{const keywords=concepts(demoKeywords(index,i));return [id,{keywords,events:[decadeEvents[i][index%2]],capsule:keywords.slice(0,3),memory:answers[i]}];}));
 return {id:`R-${String(index+1).padStart(3,'0')}`,generation:g.id,periodData,capsule:periodIds.map(id=>periodData[id].capsule[0]),synthetic:true};
}
