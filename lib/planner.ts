import {z} from 'zod';
export const weekDays=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const optionalNumber=(min:number,max:number)=>z.preprocess(v=>v===''||v==null?undefined:v,z.number().finite().min(min).max(max).optional());
export const profileSchema=z.object({age:z.number().int().min(13).max(100),height:z.number().finite().min(100).max(230),weight:z.number().finite().min(25).max(300),goal:z.enum(['fitness','strength','endurance']),sport:z.enum(['resistance','walking','cycling','swimming']),level:z.enum(['beginner','regular']),equipment:z.enum(['bodyweight','dumbbell','gym']),minutes:z.number().int().min(15).max(90),days:z.array(z.string().refine(d=>weekDays.includes(d))).min(1).max(7).transform(a=>[...new Set(a)]),injury:z.boolean(),medical:z.boolean(),limitations:z.string().max(1500),bodyFat:optionalNumber(2,75),muscle:optionalNumber(1,150),waist:optionalNumber(30,250),analysis:z.string().max(4000),preferences:z.string().max(1500).default(''),avoid:z.string().max(1500).default('')});
export type BodyProfile=z.infer<typeof profileSchema>;
export type PlanMove={name:string;sets:number;reps:number;notes:string};
export type PlanDay={day:string;kind:string;description:string;moves:PlanMove[]};
export function metrics(p:BodyProfile){const h=p.height/100,bmi=p.weight/(h*h);return {bmi:Math.round(bmi*10)/10,range:p.age>=20?[Math.round(18.5*h*h),Math.round(24.9*h*h)]:null,aboveRange:p.age>=20?Math.round(Math.max(0,p.weight-24.9*h*h)*10)/10:null};}
export function createPlan(p:BodyProfile){
 const blocked=!!p.avoid?.trim()||p.injury||p.medical||p.limitations.trim().length>0||p.age<16;
 const reasons=[`جلسه‌های ${p.minutes} دقیقه‌ای با سطح ${p.level==='beginner'?'شروع':'منظم'}.`,p.goal==='strength'?'تمرکز بر پایهٔ قدرت و تمرین مقاومتی.':p.goal==='endurance'?'تمرکز بر استقامت و فعالیت هوازی.':'ترکیب آمادگی عمومی و تمرین مقاومتی.'];
 if(p.age<20)reasons.push('این پیشنهاد هدف کاهش وزن ندارد؛ تمرین مقاومتی با آموزش و نظارت مربی انجام شود.');
 if(blocked)return {blocked:true,reasons:[...reasons,'با توجه به سن یا سابقهٔ درد، آسیب یا محدودیت، انتخاب خودکار حرکات متوقف است. برنامهٔ تأییدشدهٔ مربی یا متخصص را در «برنامه من» وارد کن.'],days:weekDays.map(day=>({day,kind:p.days.includes(day)?'نیازمند بررسی':'استراحت',description:'',moves:[] as PlanMove[]}))};
 const adult=p.age>=20,equipment=adult?p.equipment:'bodyweight';
 const pools:Record<string,string[]>={bodyweight:['نشستن و برخاستن از صندلی','شنا روی دیوار','پل باسن','برد داگ','جمع کردن کتف ایستاده'],dumbbell:['اسکوات به صندلی','پرس سینه دمبل روی زمین','زیربغل دمبل تک دست','پل باسن','جلو بازو دمبل'],gym:['اسکوات به صندلی','پرس سینه دستگاه','قایقی دستگاه','پشت پا دستگاه','جلو بازو دمبل']};
 const strengthDays:number[]=[];
 if(p.sport==='resistance')for(let i=0;i<7;i++){if(p.days.includes(weekDays[i])&&strengthDays.length< (p.level==='regular'&&p.goal==='strength'?3:2)&&!strengthDays.some(j=>Math.min(Math.abs(i-j),7-Math.abs(i-j))<2))strengthDays.push(i);}
 const aerobic=p.sport==='cycling'?'دوچرخهٔ ثابت':p.sport==='swimming'?'شنا در استخر با نظارت نجات‌غریق':'پیاده‌روی با شدت قابل‌گفت‌وگو';
 const days=weekDays.map((day,i):PlanDay=>{
 if(!p.days.includes(day))return {day,kind:'استراحت',description:'بازیابی و فعالیت روزمرهٔ راحت، در حد تحمل.',moves:[]};
 if(!strengthDays.includes(i))return {day,kind:'هوازی سبک',description:`۵ دقیقه شروع آرام، سپس ${Math.max(5,Math.min(p.level==='beginner'?15:30,p.minutes-10))} دقیقه ${aerobic} و ۵ دقیقه پایان آرام. در صورت نیاز زمان را به بخش‌های کوتاه تقسیم کن.`,moves:[]};
 const sets=p.level==='beginner'||!adult?2:p.minutes>=40?3:2;
 return {day,kind:'قدرت پایه',description:'۵ دقیقه گرم‌کردن آرام؛ بین ست‌ها حدود ۶۰ تا ۹۰ ثانیه استراحت. حرکت را بدون درد و با کنترل اجرا کن و قبل از خستگیِ مختل‌کنندهٔ فرم توقف کن.',moves:pools[equipment].slice(0,p.minutes<25?3:5).map(name=>({name,sets,reps:8,notes:'پیشنهاد اولیه؛ بار سبک و دامنهٔ راحت. بدون حبس نفس. برای برد داگ و حرکات تک‌دست، تکرار برای هر سمت است.'}))};});
 return {blocked:false,reasons:[...reasons,'این یک الگوی شروع مبتنی بر قواعد است؛ آنالیز متنی به‌صورت پزشکی تفسیر نمی‌شود و وزن وزنه را تعیین نمی‌کند.'],days};
}
