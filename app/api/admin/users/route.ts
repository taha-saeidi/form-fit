import {getChatGPTUser} from '@/app/chatgpt-auth';
import {isAdmin} from '@/lib/admin';
import {getDb} from '@/db';
import {sql} from 'drizzle-orm';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET(req:Request){
 const user=await getChatGPTUser();
 if(!user)return reply({error:'ابتدا وارد حساب شوید.'},401);
 if(!isAdmin(user))return reply({error:'این بخش فقط برای مدیر برنامه در دسترس است.'},403);
 try{
 const url=new URL(req.url),q=(url.searchParams.get('q')||'').trim().slice(0,120).toLowerCase();
 const page=Math.max(1,Math.min(100000,Number.parseInt(url.searchParams.get('page')||'1')||1)),size=20;
 const base=sql`WITH members AS (
 SELECT id,email,name,first_seen,last_seen FROM users
 UNION ALL SELECT DISTINCT user_id AS id,NULL AS email,NULL AS name,NULL AS first_seen,NULL AS last_seen FROM exercises WHERE user_id NOT IN (SELECT id FROM users)
 ), filtered AS (SELECT * FROM members WHERE ${q}='' OR instr(lower(coalesce(name,'')||' '||coalesce(email,'')||' '||id),${q})>0)`;
 const db=getDb();
 const rows=await db.all(sql`${base} SELECT *, (SELECT count(*) FROM exercises e WHERE e.user_id=filtered.id) AS exerciseCount,(SELECT count(*) FROM exercises e WHERE e.user_id=filtered.id AND e.completed=1) AS completedCount FROM filtered ORDER BY last_seen DESC,id LIMIT ${size} OFFSET ${(page-1)*size}`);
 const totals=await db.all(sql`${base} SELECT (SELECT count(*) FROM members) AS total,(SELECT count(*) FROM filtered) AS matched,(SELECT count(*) FROM members WHERE last_seen>=${new Date(Date.now()-7*86400000).toISOString()}) AS active,(SELECT count(*) FROM exercises) AS exercises`);
 return reply({users:rows,stats:totals[0],page,pageSize:size});
 }catch{return reply({error:'دریافت کاربران ممکن نشد؛ دوباره تلاش کنید.'},503);}
}
