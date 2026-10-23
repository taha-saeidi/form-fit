'use client';
import {useEffect,useState} from 'react';
import {House,CalendarDays,BookOpen,ScanLine,ChartNoAxesCombined} from 'lucide-react';
import {usePathname} from 'next/navigation';
const destinations=[{id:'home',label:'خانه',href:'/#home',icon:House},{id:'plan',label:'برنامه',href:'/#plan',icon:CalendarDays},{id:'learn',label:'آموزش',href:'/#learn',icon:BookOpen},{id:'camera',label:'دوربین',href:'/#camera',icon:ScanLine},{id:'progress',label:'پیشرفت',href:'/progress',icon:ChartNoAxesCombined}];
export default function MobileNavigation(){const path=usePathname();const [hash,setHash]=useState('home');const [keyboard,setKeyboard]=useState(false);
 useEffect(()=>{const update=()=>setHash(location.hash.slice(1)||'home');update();window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[path]);
 useEffect(()=>{const viewport=window.visualViewport;const resize=()=>{const el=document.activeElement;const editing=el instanceof HTMLElement&&el.matches('input,textarea,select,[contenteditable=true]');setKeyboard(!!editing&&!!viewport&&window.innerHeight-viewport.height>140)};viewport?.addEventListener('resize',resize);document.addEventListener('focusout',resize);return()=>{viewport?.removeEventListener('resize',resize);document.removeEventListener('focusout',resize)}},[]);
 const active=path==='/progress'?'progress':path==='/planner'?'plan':path==='/'?hash:'';
 if(path==='/signin'||path==='/signout')return null;
 return <nav className={'bottom-dock'+(keyboard?' keyboard-open':'')} aria-label="ناوبری اصلی"><div className="dock-inner">{destinations.map(d=><a key={d.id} href={d.href} onClick={()=>{if(path==='/'&&active===d.id)window.scrollTo({top:0,behavior:'smooth'})}} aria-current={active===d.id?'page':undefined} className={'dock-item '+(active===d.id?'is-current':'')}><span className="dock-icon"><d.icon size={22} strokeWidth={active===d.id?2.2:1.7}/></span><span>{d.label}</span></a>)}</div></nav>
}
