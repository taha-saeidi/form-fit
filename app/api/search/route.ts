import {guideFor} from '@/lib/guides';
import {searchMany,sourceNames} from '@/lib/search';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const u=new URL(req.url),q=(u.searchParams.get('q')||'').trim(),provider=u.searchParams.get('provider')||'all';
 if(q.length<2||q.length>120)return Response.json({error:'نام حرکت باید بین ۲ تا ۱۲۰ حرف باشد.'},{status:400});
 if(!['all','foreign'].includes(provider)&&!Object.hasOwn(sourceNames,provider))return Response.json({error:'منبع نامعتبر'},{status:400});
 try{
 const result=await searchMany(provider,q);
 if(!result.videos.length&&result.sources.every(s=>s.status==='unavailable'))return Response.json({error:'منابع فعلاً پاسخ ندادند؛ دوباره امتحان کنید.',...result},{status:502});
 const response=Response.json({...result,query:q,guide:guideFor(q)},{headers:{'Cache-Control':'public, max-age=300'}});
 return response;
 }catch{ return Response.json({error:'جست‌وجو موقتاً در دسترس نیست؛ دوباره امتحان کنید.'},{status:502}); }
}
