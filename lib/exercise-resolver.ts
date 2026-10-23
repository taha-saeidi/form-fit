import {muscleForQuery} from './body-map';
import index from './data/mrgym-index.json';
import {searchAliases,normalizeExercise,englishQuery} from './exercise-query';
const clean=(s:string)=>normalizeExercise(searchAliases(s).at(-1)!).replace(/(?:\bexercise\b|حرکت|اموزش|تمرین|با |روی |سوئدی)/g,'').replace(/\s/g,'');
const catalog=index.items.filter(r=>r[3]===0).map(r=>({name:String(r[0]),english:String(r[1]||''),keys:[clean(String(r[0])),clean(String(r[1]||''))].filter(Boolean)}));
function distance(a:string,b:string){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+Number(a[i-1]!==b[j-1]));row=next}return row[b.length]}
export function resolveExercise(q:string){
 const muscle=muscleForQuery(q);if(muscle)return {canonical:null,suggestions:[],queries:[muscle.name,muscle.english,...muscle.moves]};
 const key=clean(q);const exact=catalog.filter(r=>r.keys.includes(key));
 const canonical=exact.length===1?{name:exact[0].name,english:exact[0].english}:null;
 const suggestions=canonical?[]:catalog.map(r=>{const keys=r.keys;const score=Math.max(...keys.map(k=>k.includes(key)||key.includes(k)?Math.min(k.length,key.length)/Math.max(k.length,key.length):1-distance(k,key)/Math.max(k.length,key.length)));return {...r,score}}).filter(r=>r.score>=.58).sort((a,b)=>b.score-a.score).slice(0,6).map(({name,english})=>({name,english}));
 // Never silently resolve a fuzzy match: equipment and movement variants matter.
 return {canonical,suggestions,queries:[...new Set([...searchAliases(q),...(canonical?[canonical.name,canonical.english]:[]),englishQuery(q)])].filter(Boolean)};
}
