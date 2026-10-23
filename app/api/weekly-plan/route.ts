import {sameOrigin} from '@/lib/local-auth.mjs';
import {getChatGPTUser} from '@/app/chatgpt-auth';import {getDb} from '@/db';import {bodyProfiles,exercises,planImports} from '@/db/schema';import {eq} from 'drizzle-orm';import {profileSchema,createPlan} from '@/lib/planner';import {chunk} from '@/lib/chunk';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(req:Request){
 const u=await getChatGPTUser();if(!u)return reply({error:'ابتدا وارد حساب شوید.'},401);if(!sameOrigin(req))return reply({error:'درخواست نامعتبر'},403);
 try{const b:any=await req.json();if(typeof b.requestId!=='string'||!/^\w[\w-]{10,80}$/.test(b.requestId))return reply({error:'درخواست نامعتبر'},400);
 const db=getDb(),importId=u.userId+':'+b.requestId;const [old]=await db.select().from(planImports).where(eq(planImports.id,importId));if(old)return reply({ok:true,alreadySaved:true});
 const [row]=await db.select().from(bodyProfiles).where(eq(bodyProfiles.userId,u.userId));if(!row)return reply({error:'ابتدا پروفایل را ذخیره کن.'},400);
 const plan=createPlan(profileSchema.parse(JSON.parse(row.data)));if(plan.blocked)return reply({error:'این پروفایل نیازمند برنامهٔ تأییدشدهٔ مربی یا متخصص است.'},400);
 const now=new Date().toISOString();const values=plan.days.flatMap(d=>d.moves.map((m,i)=>({id:crypto.randomUUID(),userId:u.userId,name:m.name,day:d.day,sets:m.sets,reps:m.reps,notes:m.notes,video:'',completed:false,createdAt:new Date(Date.now()+i).toISOString()})));
 if(!values.length)return reply({error:'این برنامه فقط فعالیت هوازی دارد؛ راهنمای روزها در برنامه‌ساز ذخیره شده است و حرکت مقاومتی برای افزودن ندارد.'},400);
 await db.batch([db.insert(planImports).values({id:importId,userId:u.userId,createdAt:now}),...chunk(values).map(c=>db.insert(exercises).values(c))] as [any,...any[]]);return reply({ok:true,count:values.length});
 }catch{return reply({error:'افزودن برنامه انجام نشد؛ دوباره امتحان کن.'},503)}
}
