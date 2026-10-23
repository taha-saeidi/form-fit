import {foreignDetail} from '@/lib/foreign-sources';
import {validSourceId,foreignSources} from '@/lib/source-config';
import {sourceDetail} from '@/lib/mrgym';
import {persianDetail} from '@/lib/persian-sources';
export async function GET(req:Request){
 const u=new URL(req.url),id=u.searchParams.get('slug')||'',provider=u.searchParams.get('provider')||'mrgym';
 if(!validSourceId(provider,id))return Response.json({error:'نشانی نامعتبر'},{status:400});
 try{const d=foreignSources.includes(provider)?await foreignDetail(provider,id):provider==='mrgym'?await sourceDetail(id):await persianDetail(provider as 'fitamin'|'fitclub',id);const response=Response.json(d,{headers:{'Cache-Control':'public, max-age=900'}});return response}
 catch{return Response.json({error:'دریافت آموزش ممکن نشد؛ لینک منبع را باز کنید یا نتیجهٔ دیگری را انتخاب کنید.'},{status:502})}
}
