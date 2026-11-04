import {concepts,periodIds} from './domain.mjs';
import {interviewParticipants} from './interviews.mjs';
const list=s=>s.split('|');
// Fictional Madrid-based examples, distinct from the interview records.
const examples=[
 {generation:'boomer',memories:['directa','directa','directa','directa'],capsule:'Casete|Entrada de cine|CD|Cámara digital|Teléfono móvil',rows:[
  ['Radio|casete|cine|walkman|movida madrileña','23-F|Entrada de España en la CEE','Casete|Entrada de cine','Radio, cine y paseos por Madrid.','Apertura cultural.'],
  ['CD|radio|teléfono fijo|VHS|cámara analógica','Madrid, Capital Europea de la Cultura en 1992','CD|Fotografías','Las películas en casa y la música en CD.','Curiosidad.'],
  ['DVD|internet|teléfono móvil|cámara digital','11-M|Manifestaciones contra la guerra de Irak','Cámara digital|DVD','Aprender a usar internet y la fotografía digital.','Adaptación.'],
  ['smartphone|WhatsApp|radio|streaming','Confinamiento de 2020','Teléfono móvil|Fotografías','Comunicarse a distancia desde Madrid.','Cambio de hábitos.']]},
 {generation:'millennial',memories:['mediada','parcial','directa','directa'],capsule:'VHS|Game Boy|CD|Abono de transporte|Fotografía digital',rows:[
  ['Mecano|casete|walkman|movida madrileña','Movida madrileña','Casete de Mecano','La música que conoce a través de grabaciones y relatos.','Una época imaginada.'],
  ['VHS|Game Boy|CD|Titanic|cámara analógica','Recuerdos de celebraciones de 1992','Game Boy|VHS','Cine y videojuegos de infancia.','Descubrimiento.'],
  ['Messenger|Tuenti|MP3|internet|cámara digital','11-M|Crisis económica de 2008','Reproductor MP3|Abono de transporte','Quedar por Messenger y recorrer Madrid en transporte público.','Independencia.'],
  ['smartphone|WhatsApp|Spotify|Netflix|streaming','15-M|Confinamiento de 2020','Fotografía digital|Teléfono móvil','Música en streaming y nuevas formas de encontrarse.','Conexión.']]},
 {generation:'millennial',memories:['mediada','parcial','directa','directa'],capsule:'Disco de Mecano|VHS|DVD|Cámara digital|Entrada de concierto',rows:[
 ['Mecano|casete|cine|movida madrileña','Movida madrileña','Disco de Mecano','Películas y música conocidas después.','Curiosidad por una época no vivida.'],
 ['Disney|VHS|Mulán|televisión|cámara analógica','','VHS de Mulán','Películas vistas en la infancia.','Recuerdos parciales.'],
 ['DVD|Messenger|Tuenti|internet|cámara digital','11-M|Crisis económica de 2008','DVD|Cámara digital','Compartir fotos y conversaciones en internet.','Descubrimiento.'],
 ['Spotify|Instagram|smartphone|streaming|Netflix','15-M|Confinamiento de 2020','Entrada de concierto|Teléfono móvil','Conciertos en Madrid y música en streaming.','Conexión.']
]},
 {generation:'gen_z',memories:['mediada','mediada','parcial','directa'],capsule:'Casete|CD|Wii|Abono de transporte|Auriculares',rows:[
  ['casete|walkman|Mecano|movida madrileña','Movida madrileña','Casete','Relatos y música de otras generaciones.','Distancia.'],
  ['CD|VHS|Game Boy|Disney','Juegos Olímpicos de Barcelona conocidos a través de relatos','CD|VHS','Películas y juegos descubiertos después.','Una época recibida.'],
  ['Wii|Disney Channel|televisión|Cortylandia','Recuerdos fragmentarios de la crisis de 2008','Wii','Televisión, juegos y Cortylandia en la infancia.','Recuerdos fragmentarios.'],
  ['smartphone|YouTube|Spotify|Nintendo Switch|auriculares','Confinamiento de 2020','Abono de transporte|Auriculares','Moverse por Madrid y compartir música.','Crecimiento.']]}
];

export const fictionalParticipants=examples.map((p,i)=>({id:'D-'+String(i+1).padStart(3,'0'),generation:p.generation,synthetic:true,origin:'demo',capsule:list(p.capsule),general:{connections:'La música, los objetos y las formas de comunicarse.',capsuleReason:'Estos elementos sintetizan las etapas del personaje ficticio.'},periodData:Object.fromEntries(periodIds.map((key,j)=>{const [keywords,events,capsule,association,feeling]=p.rows[j];return [key,{keywords:concepts(list(keywords)),events:events?list(events):[],capsule:list(capsule),association,feeling,memory:p.memories[j],source:p.memories[j]==='mediada'?'Relatos y obras culturales conocidos después.':'',reflection:'Síntesis inventada para probar la visualización; no procede de una entrevista.'}];}))}));
export const initialParticipants=[...interviewParticipants,...fictionalParticipants];
