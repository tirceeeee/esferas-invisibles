import {concepts,generationFor,classifyAnswer,periodIds} from './domain.mjs';

// One schema drives the questionnaire and the matching sections in the card.
export const periodQuestions=[
 {key:'source',title:'Origen de la memoria',question:'Si no la viviste o apenas la recuerdas, ¿de dónde viene la imagen que tienes de esta época?'},
 {key:'association',title:'Primera asociación',question:'Cuando piensas en esta década, ¿qué es lo primero que te viene a la cabeza?'},
 {key:'feeling',title:'Una palabra o sensación',question:'¿Con qué palabra o sensación definirías esta década y por qué?'},
 {key:'culture',title:'Cultura y gustos',question:'¿Qué música, películas, series, libros, juegos o referentes culturales asocias con esta década?'},
 {key:'objects',title:'Objetos y vida cotidiana',question:'¿Qué objetos, tecnologías o formas de vida cotidiana asocias con esta época?'},
 {key:'events',title:'Acontecimientos y cambios sociales',question:'¿Qué acontecimientos, cambios sociales o momentos asocias con esta década?',list:true},
 {key:'reflection',title:'Mirada desde el presente',question:'Mirando esta década desde hoy, ¿crees que la recordamos tal y como fue? ¿Por qué?'},
 {key:'capsule',title:'Su cápsula cultural',question:'Si pudieras guardar una cápsula de esta década para alguien del futuro, ¿qué guardarías?',list:true},
 {key:'essential',title:'Tres imprescindibles',question:'De tu cápsula, ¿qué tres elementos son imprescindibles?',list:true,maxItems:3},
 {key:'one',title:'Si solo quedara uno',question:'Si solo pudieras conservar un elemento, ¿cuál elegirías y por qué?'}
];
export const generalQuestions=[
 {key:'closeness',title:'Cercanía con las épocas',question:'¿Qué década sientes más cercana y cuál más lejana? ¿Por qué?'},
 {key:'change',title:'El mayor cambio',question:'¿Entre qué décadas notas el mayor cambio cultural?'},
 {key:'connections',title:'Lo que conecta las épocas',question:'¿Qué crees que conecta estas cuatro épocas?'},
 {key:'reconsideration',title:'Después de recordar',question:'Después de responder, ¿ves alguna década de forma diferente?'},
 {key:'generations',title:'Otras generaciones',question:'¿Crees que alguien de otra generación elegiría cosas diferentes? ¿Por qué?'},
 {key:'capsuleReason',title:'Por qué conservarlos',question:'¿Por qué has elegido esos elementos para tu cápsula general?'}
];
export const splitAnswer=value=>String(value||'').split(/[;\n]+/).map(s=>s.trim()).filter(Boolean);
export function participantFromForm(form,id){
 const year=Number(form.get('year')),generation=generationFor(year);
 if(!generation)throw new Error('Comprueba el año de nacimiento.');
 const periodData={};
 for(const [i,key] of periodIds.entries()){
  const lived=form.get('lived'+i),recall=form.get('recall'+i);
  if(!['si','no'].includes(lived)||(lived==='si'&&!['claro','parcial','no'].includes(recall)))throw new Error('Indica si viviste y cómo recuerdas cada época.');
  const end=[1989,1999,2009,2020][i];
  if(year>end&&lived==='si')throw new Error('No puedes haber vivido una década anterior a tu nacimiento.');
  const row={memory:classifyAnswer(lived,recall),memoryEvidence:lived==='no'?'No vivió esta época.':recall==='claro'?'Declara recuerdos propios claros.':recall==='parcial'?'Declara recuerdos propios parciales.':'No puede precisar sus recuerdos.'};
  for(const q of periodQuestions){const value=String(form.get(q.key+i)||'').trim();row[q.key]=q.list?splitAnswer(value):value;if(q.maxItems&&row[q.key].length>q.maxItems)throw new Error('Selecciona como máximo tres imprescindibles por década.');}
  // Participants explicitly supply the short concepts used for comparisons.
  // Do not pretend that tokenizing prose is semantic keyword extraction.
  row.keywords=concepts(String(form.get('keywords'+i)||'').split(/[;,\n]+/));
  if(row.keywords.length>12)throw new Error('Usa como máximo 12 keywords por década.');
  periodData[key]=row;
 }
 const capsule=splitAnswer(form.get('capsule'));
 if(!capsule.length||capsule.length>5)throw new Error('Elige entre uno y cinco elementos para la cápsula general.');
 const general=Object.fromEntries(generalQuestions.map(q=>[q.key,String(form.get(q.key)||'').trim()]));
 return {id,generation:generation.id,periodData,capsule,general,synthetic:true,origin:'session'};
}
