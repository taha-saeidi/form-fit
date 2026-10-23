import {sameOrigin} from '@/lib/local-auth.mjs';
import {validSourceId,safeTrainingPage} from '@/lib/source-config';
import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '@/db';
import { exercises } from '@/db/schema';
import { and,eq,desc } from 'drizzle-orm';
export const dynamic='force-dynamic';
const response=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 const user=await getChatGPTUser();if(!user)return response({error:'برای ذخیره برنامه وارد حساب شوید.'},401);
 try{return response({items:await getDb().select().from(exercises).where(eq(exercises.userId,user.userId)).orderBy(desc(exercises.createdAt))});}catch{return response({error:'دریافت برنامه ممکن نشد؛ دوباره تلاش کنید.'},503);}
}
export async function POST(req:Request){
 const user=await getChatGPTUser();if(!user)return response({error:'ابتدا وارد حساب شوید.'},401);
 if(!sameOrigin(req))return response({error:'درخواست نامعتبر'},403);
 try{const b:any=await req.json();
 if(typeof b.name!=='string'||!b.name.trim()||b.name.length>120||!['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'].includes(b.day)||!Number.isInteger(b.sets)||b.sets<1||b.sets>30||!Number.isInteger(b.reps)||b.reps<1||b.reps>300)return response({error:'نام حرکت، روز، ست و تکرار را بررسی کنید.'},400);
 let video='';if(b.video){const v=b.video;if(!validSourceId(v.provider,v.id))return response({error:'ویدئوی نامعتبر'},400); video=JSON.stringify({provider:v.provider,id:v.id,title:String(v.title||'').slice(0,240),author:String(v.author||'').slice(0,120),page:safeTrainingPage(v.provider,v.page||'')});}
 const item={id:crypto.randomUUID(),userId:user.userId,name:b.name.trim(),day:b.day,sets:b.sets,reps:b.reps,video,notes:String(b.notes||'').slice(0,3000),completed:false,createdAt:new Date().toISOString()};
 await getDb().insert(exercises).values(item);return response({item},201);
 }catch{return response({error:'ذخیره انجام نشد. اتصال را بررسی کنید.'},503);}
}
export async function PATCH(req:Request){return mutate(req,false)}
export async function DELETE(req:Request){return mutate(req,true)}
async function mutate(req:Request,remove:boolean){
 const u=await getChatGPTUser();if(!u)return response({error:'ابتدا وارد شوید'},401);
 if(!sameOrigin(req))return response({error:'درخواست نامعتبر'},403);
 try{const b:any=await req.json();if(typeof b.id!=='string'||(!remove&&typeof b.completed!=='boolean'&&!b.edit))return response({error:'درخواست نامعتبر'},400);
 const where=and(eq(exercises.id,b.id),eq(exercises.userId,u.userId));
 let changes:any={completed:b.completed};if(!remove&&b.edit){const e=b.edit;if(typeof e.name!=='string'||!e.name.trim()||e.name.length>120||!['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'].includes(e.day)||!Number.isInteger(e.sets)||e.sets<1||e.sets>30||!Number.isInteger(e.reps)||e.reps<1||e.reps>300||typeof e.notes!=='string'||e.notes.length>3000)return response({error:'مشخصات حرکت نامعتبر است.'},400);const [old]=await getDb().select().from(exercises).where(where);if(!old)return response({error:'حرکت پیدا نشد'},404);changes={name:e.name.trim(),day:e.day,sets:e.sets,reps:e.reps,notes:e.notes,...(old.name!==e.name.trim()?{video:''}:{})};}

 const result=remove?await getDb().delete(exercises).where(where).returning({id:exercises.id}):await getDb().update(exercises).set(changes).where(where).returning({id:exercises.id});
 return result.length?response({ok:true}):response({error:'حرکت پیدا نشد'},404);
 }catch{return response({error:'تغییر ذخیره نشد'},503);}
}
