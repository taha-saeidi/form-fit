export const cameraModes=[
 {id:'curl',label:'جلو بازو ایستاده',hint:'روبه‌رو؛ شانه، آرنج، مچ و لگن دیده شوند. بررسی انحراف تنه و فاصلهٔ آرنج.'},
 {id:'hammer',label:'جلو بازو چکشی',hint:'روبه‌رو؛ بررسی تنه و فاصلهٔ آرنج. چرخش مچ و نوع گرفتن دمبل ارزیابی نمی‌شود.'},
 {id:'lateral',label:'نشر جانب',hint:'روبه‌رو؛ بررسی انحراف جانبی تنه و نمایش زاویهٔ بازو. وزن مناسب تعیین نمی‌شود.'},
 {id:'press',label:'پرس سرشانه',hint:'روبه‌رو؛ بررسی انحراف جانبی تنه و نمایش زاویهٔ آرنج. قوس کمر ارزیابی نمی‌شود.'},
 {id:'plank',label:'پلانک',hint:'پهلو؛ بررسی راستای شانه، لگن و مچ پا.'},
 {id:'pushup',label:'شنا سوئدی',hint:'پهلو؛ بررسی راستای تنه و نمایش زاویهٔ آرنج. دست، شانه، لگن و پا دیده شوند.'},
 {id:'squat',label:'اسکوات',hint:'پهلو؛ فقط نمایش زاویهٔ زانو، بدون هشدار یا تعیین عمق مناسب.'},
 {id:'lunge',label:'لانج',hint:'پهلو؛ فقط زاویهٔ زانوی سمت واضح‌تر. تعادل یا هم‌راستایی زانو ارزیابی نمی‌شود.'},
 {id:'wallsit',label:'نشستن کنار دیوار',hint:'پهلو؛ فقط نمایش زاویهٔ زانو. تماس با دیوار و تحمل فشار ارزیابی نمی‌شود.'},
 {id:'bridge',label:'پل باسن',hint:'پهلو؛ فقط نمایش زاویهٔ شانه، لگن و زانو. فشار کمر ارزیابی نمی‌شود.'}
];
export type Point={x:number;y:number;visibility?:number};
export function angle(a:Point,b:Point,c:Point){const u=[a.x-b.x,a.y-b.y],v=[c.x-b.x,c.y-b.y];const d=Math.hypot(...u)*Math.hypot(...v);return d?Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/d)))*180/Math.PI:NaN;}
export function analyze(points:Point[],mode:string,width:number,height:number){
 if(!cameraModes.some(m=>m.id===mode)||points.length<29||width<=0||height<=0)return {state:'unknown',message:'دادهٔ کافی برای تحلیل نیست.',angle:null};
 const p=points.map(v=>({...v,x:v.x*width,y:v.y*height}));
 const good=(ids:number[])=>ids.every(i=>points[i]&&(points[i].visibility??0)>.7&&points[i].x>.02&&points[i].x<.98&&points[i].y>.02&&points[i].y<.98);
 if(['curl','hammer','lateral','press'].includes(mode)){
 if(!good([11,12,13,14,15,16,23,24]))return {state:'unknown',message:'هر دو شانه، آرنج، دست و لگن باید واضح در کادر باشند.',angle:null};
 const w=Math.abs(p[11].x-p[12].x),h=Math.abs((p[23].y+p[24].y-p[11].y-p[12].y)/2);
 if(w<h*.45)return {state:'unknown',message:'روبه‌روی دوربین قرار بگیر؛ شانه‌ها باید هم‌زمان دیده شوند.',angle:null};
 const lean=Math.abs((p[11].x+p[12].x-p[23].x-p[24].x)/2)/Math.max(h,1);
 if(mode==='lateral'||mode==='press'){
 const a=mode==='lateral'?(angle(p[23],p[11],p[13])+angle(p[24],p[12],p[14]))/2:(angle(p[11],p[13],p[15])+angle(p[12],p[14],p[16]))/2;
 if(!Number.isFinite(a))return {state:'unknown',message:'مفاصل واضح نیستند.',angle:null};
 return {state:lean>.22?'warning':'tracking',message:lean>.22?'تنه به کنار متمایل شده؛ وضعیت را بررسی کن.':'بررسی انحراف جانبی تنه؛ زاویهٔ تقریبی '+(mode==='lateral'?'بازو':'آرنج'),angle:Math.round(a)};
 }
 const flare=Math.max(Math.abs(p[13].x-p[11].x),Math.abs(p[14].x-p[12].x))/Math.max(w,1);
 const a=(angle(p[11],p[13],p[15])+angle(p[12],p[14],p[16]))/2;
 return {state:lean>.22||flare>.55?'warning':'tracking',message:lean>.22?'تنه به کنار متمایل شده؛ وضعیت بدن را بررسی کن.':flare>.55?'آرنج‌ها از تنه فاصله گرفته‌اند؛ وضعیت بازو را بررسی کن.':'در حال بررسی انحراف جانبی تنه و فاصله آرنج‌ها',angle:Math.round(a)};
 }
 const left=[11,13,15,23,25,27],right=[12,14,16,24,26,28];
 const sum=(ids:number[])=>ids.reduce((s,i)=>s+(points[i]?.visibility||0),0);const k=sum(left)>sum(right)?0:1;
 const sh=11+k,hip=23+k,knee=25+k,ankle=27+k;
 if(!good([sh,hip,knee,ankle]))return {state:'unknown',message:'از پهلو بایست؛ شانه، لگن، زانو و مچ پا باید در کادر باشند.',angle:null};
 const torso=Math.hypot(p[sh].x-p[hip].x,p[sh].y-p[hip].y);
 if(Math.abs(p[11].x-p[12].x)>torso*.55)return {state:'unknown',message:'برای این تحلیل، بدن را از پهلو به دوربین نشان بده.',angle:null};
 if(mode==='bridge'){const a=angle(p[sh],p[hip],p[knee]);return {state:'tracking',message:'فقط زاویهٔ لگن نمایش داده می‌شود؛ فشار کمر ارزیابی نمی‌شود.',angle:Number.isFinite(a)?Math.round(a):null};}
 if(mode==='plank'||mode==='pushup'){
 const a=angle(p[sh],p[hip],p[ankle]);
 if(mode==='pushup'&&!good([13+k,15+k]))return {state:'unknown',message:'آرنج و مچ سمت دوربین باید دیده شوند.',angle:null};
 if(Math.abs(p[sh].y-p[ankle].y)>Math.abs(p[sh].x-p[ankle].x)*.7)return {state:'unknown',message:'در وضعیت پلانک از پهلو قرار بگیر؛ تمام بدن دیده شود.',angle:null};
 return {state:a<155?'warning':'tracking',message:a<155?'راستای لگن تغییر کرده؛ وضعیت تنه و لگن را بررسی کن.':'در حال بررسی راستای شانه، لگن و مچ پا',angle:Math.round(mode==='pushup'?angle(p[sh],p[13+k],p[15+k]):a)};
 }
 return {state:'tracking',message:'فقط زاویه زانو اندازه‌گیری می‌شود؛ ایمنی یا عمق مناسب ارزیابی نمی‌شود.',angle:Math.round(angle(p[hip],p[knee],p[ankle]))};
}
