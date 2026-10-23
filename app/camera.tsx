'use client';
import {useRef,useState,useEffect} from 'react';
import {Camera,CameraOff,Volume2,VolumeX,ShieldCheck,ScanLine} from 'lucide-react';
import {analyze,cameraModes} from '@/lib/pose-analysis';
export default function CameraPanel(){
 const [mode,setMode]=useState('curl'),[running,setRunning]=useState(false),[loading,setLoading]=useState(false),[sound,setSound]=useState(true),[status,setStatus]=useState({state:'idle',message:'گوشی را ثابت بگذار و تمام بخش‌های لازم بدن را در کادر قرار بده.',angle:null as number|null});
 const video=useRef<HTMLVideoElement>(null),canvas=useRef<HTMLCanvasElement>(null),stream=useRef<MediaStream|null>(null),model=useRef<any>(null),frame=useRef(0),active=useRef(false),soundRef=useRef(sound),audio=useRef<AudioContext|null>(null),generation=useRef(0);
 useEffect(()=>{soundRef.current=sound},[sound]);
 function stop(){generation.current++;active.current=false;cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;model.current?.close();model.current=null;if(video.current)video.current.srcObject=null;audio.current?.close().catch(()=>{});audio.current=null;setRunning(false);setLoading(false);canvas.current?.getContext('2d')?.clearRect(0,0,canvas.current.width,canvas.current.height);}
 useEffect(()=>{const hide=()=>{if(document.hidden){stop();setStatus({state:'idle',message:'دوربین هنگام خروج از صفحه خاموش شد.',angle:null})}};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);stop()}},[]);
 async function start(){
 stop();const g=generation.current;setLoading(true);setStatus({state:'idle',message:'در حال آماده‌سازی دوربین و مدل؛ بار اول کمی زمان می‌برد…',angle:null});
 try{
 if(!navigator.mediaDevices?.getUserMedia)throw Error('مرورگر به دوربین دسترسی ندارد. لینک را در Chrome یا Safari و با HTTPS باز کن.');
 const AC=window.AudioContext||(window as any).webkitAudioContext;if(AC){audio.current=new AC();await audio.current?.resume()}
 const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:20}}});
 if(g!==generation.current){s.getTracks().forEach(t=>t.stop());return}stream.current=s;video.current!.srcObject=s;await video.current!.play();
 const path='/pose-engine.js';const engine=await import(/* @vite-ignore */ path);const m=await engine.createPose();if(g!==generation.current){m.close();return}model.current=m;active.current=true;setRunning(true);setLoading(false);
 let last=0,lastVideo=-1,lastBeep=0,warningSince=0;
 const loop=(now:number)=>{
 if(!active.current)return;
 if(now-last>100&&video.current&&video.current.readyState>=2&&video.current.currentTime!==lastVideo){
 last=now;lastVideo=video.current.currentTime;
 try{const v=video.current,c=canvas.current!,ctx=c.getContext('2d')!;c.width=v.videoWidth;c.height=v.videoHeight;ctx.clearRect(0,0,c.width,c.height);
 const result=m.detectForVideo(v,now),pts=result.landmarks?.[0];
 const st=pts?analyze(pts,mode,c.width,c.height):{state:'unknown',message:'بدن پیدا نشد؛ فاصله و نور را تنظیم کن.',angle:null};
 if(pts){ctx.strokeStyle=st.state==='warning'?'#ffb876':'#b7ef55';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=3;
 for(const [a,b] of [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]]){if(pts[a].visibility>.7&&pts[b].visibility>.7){ctx.beginPath();ctx.moveTo(pts[a].x*c.width,pts[a].y*c.height);ctx.lineTo(pts[b].x*c.width,pts[b].y*c.height);ctx.stroke()}}
 for(const i of [11,12,13,14,15,16,23,24,25,26,27,28])if(pts[i].visibility>.7){ctx.beginPath();ctx.arc(pts[i].x*c.width,pts[i].y*c.height,5,0,Math.PI*2);ctx.fill()}}
 setStatus(st);
 if(st.state==='warning'){if(!warningSince)warningSince=now;if(now-warningSince>900&&now-lastBeep>4000&&soundRef.current&&audio.current){const ac=audio.current,o=ac.createOscillator(),gain=ac.createGain();o.frequency.value=580;gain.gain.setValueAtTime(.14,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.25);o.connect(gain);gain.connect(ac.destination);o.start();o.stop(ac.currentTime+.25);lastBeep=now;}}else warningSince=0;
 }catch{stop();setStatus({state:'error',message:'تحلیل متوقف شد؛ دوربین را دوباره روشن کن.',angle:null});return}}
 frame.current=requestAnimationFrame(loop)};frame.current=requestAnimationFrame(loop);
 }catch(e:any){if(g!==generation.current)return;stop();setStatus({state:'error',message:e.name==='NotAllowedError'?'اجازه دوربین داده نشد. دسترسی دوربین را در تنظیمات مرورگر فعال کن.':e.name==='NotFoundError'?'دوربینی پیدا نشد.':e.message?.startsWith('مرورگر')?e.message:'دوربین یا مدل بارگیری نشد. اتصال اینترنت و دسترسی دوربین را بررسی کن.',angle:null})}
 }
 return <section><div className="section-heading"><div><span className="eyebrow">FORM CHECK / آزمایشی</span><h2>حرکتت را بهتر ببین.</h2><p>تحلیل محدود نقاط بدن، روی همین دستگاه</p></div><span className="chip"><ShieldCheck size={15}/> بدون ضبط تصویر</span></div>
 <div className="camera-grid"><div className="camera-box"><video ref={video} muted playsInline/><canvas ref={canvas}/>{!running&&<div className="camera-placeholder"><ScanLine size={66} strokeWidth={1}/><h3>{loading?'در حال آماده‌سازی…':'آماده‌ای فرم حرکتت را ببینی؟'}</h3><p>دوربین سلفی • فضای روشن • گوشی ثابت</p></div>}<span className="camera-live">{running?'● دوربین روشن':'○ دوربین خاموش'}</span>{status.angle!==null&&<div className="angle"><b>{status.angle}°</b><small>زاویه تقریبی</small></div>}</div>
 <aside className="panel camera-controls"><h3>تنظیم بررسی حرکت</h3><label>نوع بررسی<select value={mode} disabled={running||loading} onChange={e=>setMode(e.target.value)}>{cameraModes.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label><p className="small">{cameraModes.find(m=>m.id===mode)?.hint}</p><button className="sound-toggle" onClick={()=>setSound(!sound)}>{sound?<Volume2 size={18}/>:<VolumeX size={18}/>} هشدار صوتی <span>{sound?'روشن':'خاموش'}</span></button><div aria-live="polite" className={'status '+status.state}>{status.message}</div><button className="primary full" disabled={loading} onClick={running?()=>{stop();setStatus({state:'idle',message:'دوربین خاموش شد.',angle:null})}:start}>{running?<CameraOff size={18}/>:<Camera size={18}/>} {running?'توقف دوربین':loading?'در حال بارگیری…':'فعال‌کردن دوربین سلفی'}</button>{loading&&<button className="ghost full" onClick={stop}>لغو</button>}<p className="small caution">این بررسی آزمایشی است و تأیید ایمنی حرکت یا جایگزین مربی نیست. زاویه دوربین و پوشیده بودن مفاصل روی نتیجه اثر می‌گذارد. در صورت درد، تمرین را متوقف کن.</p></aside></div></section>
}
