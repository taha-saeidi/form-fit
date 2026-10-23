import {sameOrigin} from '@/lib/local-auth.mjs';
import {getChatGPTUser} from '@/app/chatgpt-auth';import {getDb} from '@/db';import {exercises,workoutProgress,setLogs} from '@/db/schema';import {eq,and} from 'drizzle-orm';
export const dynamic='force-dynamic';
import {todayKey} from '@/lib/date';
const reply=(d:unknown,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){const u=await getChatGPTUser();if(!u)return reply({error:'ابتدا وارد شوید.'},401);try{return reply({date:todayKey(),items:await getDb().select().from(workoutProgress).where(and(eq(workoutProgress.userId,u.userId),eq(workoutProgress.date,todayKey())))});}catch{return reply({error:'دریافت پیشرفت ممکن نشد.'},503)}}
export async function PUT(req:Request){const u=await getChatGPTUser();if(!u)return reply({error:'ابتدا وارد شوید.'},401);if(!sameOrigin(req))return reply({error:'درخواست نامعتبر'},403);
 try{const b:any=await req.json();if(typeof b.exerciseId!=='string'||!Number.isInteger(b.completedSets)||b.completedSets<0)return reply({error:'مقدار ست نامعتبر است.'},400);const db=getDb();const [exercise]=await db.select().from(exercises).where(and(eq(exercises.id,b.exerciseId),eq(exercises.userId,u.userId)));if(!exercise)return reply({error:'حرکت پیدا نشد.'},404);if(b.completedSets>exercise.sets)return reply({error:'تعداد ست بیشتر از برنامه است.'},400);
 const date=todayKey();if(b.date!==date)return reply({error:'روز عوض شده؛ جلسه را ببند و دوباره باز کن.'},409);const id=u.userId+':'+date+':'+exercise.id,updatedAt=new Date().toISOString();
 const write=db.insert(workoutProgress).values({id,userId:u.userId,exerciseId:exercise.id,date,completedSets:b.completedSets,updatedAt}).onConflictDoUpdate({target:workoutProgress.id,set:{completedSets:b.completedSets,updatedAt}});if(b.completedSets===0)await db.batch([write,db.delete(setLogs).where(and(eq(setLogs.userId,u.userId),eq(setLogs.exerciseId,exercise.id),eq(setLogs.date,date)))]);else await write;return reply({ok:true});
 }catch{return reply({error:'ست ذخیره نشد؛ دوباره تلاش کن.'},503)}}
