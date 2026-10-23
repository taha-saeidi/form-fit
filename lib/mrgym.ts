import snapshot from './data/mrgym-index.json';
import {sourceFetch} from './source-fetch';
import {searchAliases,matchesTitle} from './exercise-query';
export function normalize(s:string){return s.toLowerCase().replace(/[يئ]/g,'ی').replace(/ك/g,'ک').replace(/[آأإ]/g,'ا').replace(/[\s‌\-]+/g,' ').trim()}
export const fetchText=sourceFetch;
export async function sourceDetail(slug:string){
 if(!/^[a-z0-9-]{1,180}$/.test(slug))throw Error('Invalid slug');
 const page='https://mrgym.ir/exercise/'+slug+'/';const html=await fetchText(page);
 const all:any[]=[];
 for(const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)){try{const d=JSON.parse(match[1]);all.push(...(d['@graph']||[d]))}catch{}}
 const video=all.find(v=>v['@type']==='VideoObject'),how=all.find(v=>v['@type']==='HowTo');
 const media=video?.contentUrl; if(typeof media!=='string'||!media.startsWith('https://video.mrgym.ir/')||!media.toLowerCase().endsWith('.mp4'))throw Error('No supported video');
 return {id:slug,provider:'mrgym',title:String(video.name||slug).slice(0,240),author:'مسترجیم',media,page,thumbnail:Array.isArray(video.thumbnailUrl)?video.thumbnailUrl[0]:video.thumbnailUrl||'',equipment:(how?.tool||[]).map((v:any)=>String(v.name)).join('، ').slice(0,200),description:String(video.description||'').split(/\s+/).slice(0,20).join(' ')+'…'};
}
export async function searchMrgym(q:string){
 let data:any;try{data=JSON.parse(await fetchText('https://mrgym.ir/media/mrgym-search/index.json'));}catch{data=snapshot;}
 if(!Array.isArray(data.items))throw Error('Invalid index');
 return data.items.filter((i:any)=>i[3]===0&&searchAliases(q).some(alias=>matchesTitle(String(i[0])+' '+String(i[1]||''),alias))).slice(0,8).map((i:any)=>{
 const path=new URL(i[2], 'https://mrgym.ir').pathname;const slug=path.split('/').filter(Boolean).pop();
 return {id:slug,provider:'mrgym',title:String(i[0]),author:'مسترجیم',thumbnail:i[4]?String(data.thumb||'')+i[4]:'',page:'https://mrgym.ir'+path,duration:0,description:''};
 }).filter((v:any)=>/^[a-z0-9-]{1,180}$/.test(v.id));
}
