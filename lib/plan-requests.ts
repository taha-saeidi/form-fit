import {getDb} from '@/db';import {planRequests,bodyProfiles,setLogs,sessionFeedback,reviewedPlans} from '@/db/schema';import {eq,desc,and,inArray} from 'drizzle-orm';import {profileSchema} from './planner';
export function currentWeek(){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+1)%7));return d.toISOString().slice(0,10);}
export async function listRequests(userId?:string){
 const db=getDb();const rows=await db.select().from(planRequests).where(userId?eq(planRequests.userId,userId):undefined).orderBy(desc(planRequests.createdAt)).limit(50);if(!rows.length)return [];
 const allowed=userId?[]:[...new Set(rows.filter(r=>JSON.parse(r.profile).trainingConsent).map(r=>r.userId))];
 const [plans,sets,feedback]=await Promise.all([
 db.select().from(reviewedPlans).where(inArray(reviewedPlans.requestId,rows.map(r=>r.id))).orderBy(desc(reviewedPlans.createdAt)),
 allowed.length?db.select().from(setLogs).where(inArray(setLogs.userId,allowed)).orderBy(desc(setLogs.date)).limit(5000):Promise.resolve([]),
 allowed.length?db.select().from(sessionFeedback).where(inArray(sessionFeedback.userId,allowed)).orderBy(desc(sessionFeedback.date)).limit(500):Promise.resolve([])
 ]);
 return rows.map(r=>({...r,plans:plans.filter(p=>p.requestId===r.id).map(p=>({...p,moves:JSON.parse(p.moves)})),profile:userId?undefined:JSON.parse(r.profile),training:userId||!JSON.parse(r.profile).trainingConsent?undefined:{sets:sets.filter(s=>s.userId===r.userId).slice(0,100),feedback:feedback.filter(s=>s.userId===r.userId).slice(0,10)},answer:userId&&r.status!=='answered'?'':r.answer}));
}
export async function submitRequest(userId:string){const db=getDb(),week=currentWeek(),id=userId+':'+week;const [p]=await db.select().from(bodyProfiles).where(eq(bodyProfiles.userId,userId));if(!p)throw Error('ابتدا پروفایل را ذخیره کن.');const profile=profileSchema.parse(JSON.parse(p.data));const now=new Date().toISOString();await db.insert(planRequests).values({id,userId,week,profile:JSON.stringify({...profile,trainingConsent:true}),status:'pending',answer:'',createdAt:now,updatedAt:now}).onConflictDoNothing();return {id,week};}
export async function answerRequest(id:string,answer:string,status:'draft'|'answered'){
 if(typeof id!=='string'||typeof answer!=='string'||answer.trim().length<30||answer.length>16000)throw Error('پاسخ باید بین ۳۰ تا ۱۶۰۰۰ حرف باشد.');
 // Published responses cannot be silently overwritten by an agent.
 const rows=await getDb().update(planRequests).set({answer:answer.trim(),status,updatedAt:new Date().toISOString()}).where(status==='draft'?and(eq(planRequests.id,id),eq(planRequests.status,'pending')):eq(planRequests.id,id)).returning({id:planRequests.id});if(!rows.length)throw Error('درخواست موجود نیست یا قبلاً پاسخ گرفته است.');return {ok:true};
}
