export const providers={fitamin:{name:'فیتامین',origin:'https://fitamin.ir',base:'https://fitamin.ir/mag/wp-json/wp/v2',subtype:'movement'},fitclub:{name:'فیت‌کلاب',origin:'https://fitclub.ir',base:'https://fitclub.ir/blog/wp-json/wp/v2',subtype:'post'}} as const;
export type PersianProvider=keyof typeof providers;
export function plain(s:unknown){return String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#(?:x([0-9a-f]+)|(\d+));/gi,(_,h,d)=>{const n=parseInt(h||d,h?16:10);return n<=0x10ffff?String.fromCodePoint(n):''}).replace(/&(?:nbsp|amp|quot|lt|gt);/g,m=>({'&nbsp;':' ','&amp;':'&','&quot;':'"','&lt;':'<','&gt;':'>'}[m]||' ')).replace(/\s+/g,' ').trim()}
async function get(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(10000),redirect:'error',headers:{Accept:'application/json,text/html'}});if(!r.ok)throw Error('Source unavailable');return r}
export function safePage(provider:PersianProvider,page:string){try{const u=new URL(page);return u.origin===providers[provider].origin&&!u.username&&!u.password&&u.pathname.startsWith(provider==='fitamin'?'/mag/':'/blog/')?u.href:''}catch{return ''}}
export async function searchPersian(provider:PersianProvider,q:string){
 const p=providers[provider],r=await get(p.base+'/search?'+new URLSearchParams({search:q,subtype:p.subtype,per_page:'8'})),d:any=await r.json();
 if(!Array.isArray(d))throw Error('Invalid response');
 return d.filter(v=>Number.isInteger(v.id)&&v.id>0&&safePage(provider,v.url)).map(v=>({id:String(v.id),provider,title:plain(v.title).slice(0,240),author:p.name,page:safePage(provider,v.url),thumbnail:'',description:'',kind:'lesson'}));
}
export function extractMedia(html:string,provider:PersianProvider){
 const clean=html.replace(/\\\//g,'/').replace(/&amp;/g,'&').replace(/&#038;/g,'&');
 const aparat=clean.match(/(?:aparat\.com\/(?:embed\/|video\/video\/embed\/videohash\/))([a-zA-Z0-9]+)/)?.[1];
 let media='';
 for(const match of clean.matchAll(/https:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?/gi)){try{const u=new URL(match[0]);const root=new URL(providers[provider].origin).hostname;if(u.hostname===root||u.hostname.endsWith('.'+root)){media=u.href;break}}catch{}}
 return {media,embed:aparat?'https://www.aparat.com/video/video/embed/videohash/'+aparat+'/vt/frame':''};
}
export async function persianDetail(provider:PersianProvider,id:string){
 if(!/^\d{1,10}$/.test(id))throw Error('Invalid ID');
 const p=providers[provider],r=await get(p.base+'/'+(provider==='fitamin'?'movement':'posts')+'/'+id),d:any=await r.json();
 const page=safePage(provider,d.link);if(!page)throw Error('Invalid source');
 let html=String(d.content?.rendered||'');let media=extractMedia(html,provider);let equipment='';
 if(provider==='fitamin'){
 try{const pageResponse=await get(page);const pageHTML=await pageResponse.text();media=extractMedia(pageHTML,provider);const row=pageHTML.match(/وسایل مورد نیاز[\s\S]{0,1000}?<\/tr>/)?.[0];if(row)equipment=plain(row).replace('وسایل مورد نیاز','').slice(0,150)}catch{}
 }
 return {id,provider,title:plain(d.title?.rendered).slice(0,240),author:p.name,page,...media,equipment,description:plain(d.excerpt?.rendered||html).split(' ').slice(0,20).join(' ')+'…'};
}
