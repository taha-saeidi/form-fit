import {resolveExercise} from './exercise-resolver';
import {searchMrgym,normalize} from './mrgym';
import {searchPersian,plain} from './persian-sources';
export {sourceNames} from './source-config';
import {sourceNames,foreignSources} from './source-config';
import {localSearch,foreignSearch} from './foreign-sources';
import {sourceFetch} from './source-fetch';
import {searchAliases,englishQuery} from './exercise-query';
async function json(url:string){return JSON.parse(await sourceFetch(url))}
export async function searchOne(provider:string,q:string):Promise<any[]>{
 if(['wger','freedb'].includes(provider))return localSearch(provider,q);
 if(provider==='strengthlog'||provider==='fitnessprogramer')return foreignSearch(provider,q);
 if(provider==='mrgym')return searchMrgym(q);
 if(provider==='fitamin'||provider==='fitclub')return searchPersian(provider,q);
 if(provider==='aparat'){
 const d=await json('https://www.aparat.com/etc/api/videobysearch/text/'+encodeURIComponent(q));if(d.videobysearch===null)return [];if(!Array.isArray(d.videobysearch))throw Error('unavailable');
 return d.videobysearch.filter((v:any)=>v.uid&&/^[a-zA-Z0-9]+$/.test(v.uid)&&!v.isHidden).slice(0,8).map((v:any)=>({id:v.uid,provider,title:plain(v.title).slice(0,240),author:plain(v.sender_name||v.username).slice(0,120),thumbnail:String(v.small_poster||v.big_poster||''),duration:Number(v.duration)||0,description:'',kind:'video'}));
 }
 if(provider==='dailymotion'){
 const d=await json('https://api.dailymotion.com/videos?'+new URLSearchParams({search:englishQuery(q)+' exercise technique',limit:'8',fields:'id,title,thumbnail_url,owner.screenname,duration,description',explicit:'false',sort:'relevance'}));if(!Array.isArray(d.list))throw Error('unavailable');
 return d.list.filter((v:any)=>/^[a-zA-Z0-9]+$/.test(v.id)).map((v:any)=>({id:v.id,provider,title:plain(v.title).slice(0,240),author:plain(v['owner.screenname']).slice(0,120),thumbnail:String(v.thumbnail_url||''),duration:Number(v.duration)||0,description:plain(v.description).split(' ').slice(0,20).join(' '),kind:'video'}));
 }
 throw Error('Invalid provider');
}
export function rankResults(items:any[],q:string){const tokens=normalize(q).split(' ').filter(Boolean);const seen=new Set<string>();return items.filter(v=>{const k=v.provider+':'+v.id;if(seen.has(k))return false;seen.add(k);return true}).map((v,i)=>{const t=normalize(v.title);return {...v,_rank:(t===normalize(q)?100:0)+tokens.reduce((s,w)=>s+(t.includes(w)?10:0),0)-i*.001}}).sort((a,b)=>b._rank-a._rank).map(({_rank,...v})=>v)}
export async function searchMany(provider:string,q:string){
 const resolution=resolveExercise(q);
 const list=provider==='all'?['mrgym','fitamin','fitclub','aparat',...foreignSources,'dailymotion']:provider==='foreign'?[...foreignSources,'dailymotion']:[provider];
 const settled=await Promise.allSettled(list.map(async p=>{
   const foreign=[...foreignSources,'dailymotion'].includes(p);
   const primary=foreign?(resolution.canonical?.english||englishQuery(q)):q;
   let results:any[]=[];let succeeded=false;
   try{results=await searchOne(p,primary);succeeded=true}catch{}
   if(results.length)return {results,queries:[primary]};
   const alternatives=resolution.queries.filter(x=>x!==primary&&(/[\u0600-\u06ff]/.test(x)!==foreign)).slice(0,2);
   const retried=await Promise.allSettled(alternatives.map(x=>searchOne(p,x)));
   for(const r of retried)if(r.status==='fulfilled'){succeeded=true;results.push(...r.value)}
   if(!succeeded)throw Error('Provider unavailable');
   return {results,queries:[primary,...alternatives]};
 }));
 const videos:any[]=[],sources:any[]=[];
 settled.forEach((r,i)=>{sources.push({id:list[i],name:sourceNames[list[i]],status:r.status==='fulfilled'?'ok':'unavailable',count:r.status==='fulfilled'?r.value.results.length:0,queries:r.status==='fulfilled'?r.value.queries:[]});if(r.status==='fulfilled')videos.push(...r.value.results)});
 if(!videos.length&&!['all','foreign','freedb','wger'].includes(provider)){for(const p of ['freedb','wger']){const found=localSearch(p,resolution.canonical?.english||q);videos.push(...found);if(found.length)sources.push({id:p,name:sourceNames[p],status:'ok',count:found.length});}}
 return {videos:rankResults(videos,q),sources,translatedQuery:resolution.canonical?.english||englishQuery(q),suggestions:resolution.suggestions,queries:resolution.queries,canonical:resolution.canonical};
}
