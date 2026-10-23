'use client';
import {useState} from 'react';
import {muscleGroups} from '@/lib/body-map';
type Region=typeof muscleGroups[number];
const shapes:Record<string,string>={
 chest:'M78 77 Q99 68 116 82 L116 111 Q95 119 80 104Z M122 82 Q140 68 160 77 L158 104 Q140 119 122 111Z',
 shoulders:'M77 75 Q62 75 58 99 L73 108 L80 91Z M161 75 Q176 75 180 99 L165 108 L158 91Z',
 biceps:'M58 105 L73 114 L68 150 L51 145Z M180 105 L165 114 L170 150 L187 145Z',
 forearms:'M49 153 L66 156 L54 197 L39 192Z M189 153 L172 156 L184 197 L199 192Z',
 abs:'M96 121 L115 119 L115 181 L99 174Z M123 119 L142 121 L139 174 L123 181Z',
 quads:'M87 204 L114 211 L110 275 L88 280 L80 236Z M124 211 L151 204 L158 236 L150 280 L128 275Z',
 traps:'M105 61 L113 71 L117 108 L84 80Z M125 61 L133 71 L154 80 L121 108Z',
 back:'M82 87 L111 113 L115 166 L94 153Z M156 87 L127 113 L123 166 L144 153Z',
 triceps:'M58 104 L75 112 L69 151 L51 145Z M180 104 L163 112 L169 151 L187 145Z',
 lowerback:'M96 158 L115 173 L115 193 L94 191Z M142 158 L123 173 L123 193 L144 191Z',
 glutes:'M91 197 Q107 190 116 202 L116 230 Q99 241 82 227Z M147 197 Q131 190 122 202 L122 230 Q139 241 156 227Z',
 hamstrings:'M83 237 L114 240 L109 282 L88 283Z M155 237 L124 240 L129 282 L150 283Z',
 calves:'M89 295 L109 292 L105 332 L94 347 L86 327Z M149 295 L129 292 L133 332 L144 347 L152 327Z'
};
export default function BodyMap({onSearch}:{onSearch:(q:string)=>void}){
 const [side,setSide]=useState<'front'|'back'>('front'),[selected,setSelected]=useState<Region|null>(null);
 function choose(m:Region){setSelected(m);setSide(m.side);onSearch(m.name)}
 return <section className="muscle-explorer" aria-labelledby="muscle-title"><div className="muscle-heading"><div><span className="eyebrow">از عضله شروع کن</span><h2 id="muscle-title">کدام قسمت بدن؟</h2><p>روی نقشه یا نام عضله بزن؛ آموزش‌های مرتبط همین پایین نمایش داده می‌شوند.</p></div><div className="muscle-views" aria-label="نمای بدن">{(['front','back'] as const).map(v=><button type="button" key={v} aria-pressed={side===v} onClick={()=>setSide(v)}>{v==='front'?'نمای جلو':'نمای پشت'}</button>)}</div></div><div className="muscle-layout"><div className="muscle-figure"><svg viewBox="0 0 238 390" aria-label={'نقشهٔ تعاملی عضلات، '+(side==='front'?'نمای جلو':'نمای پشت')}><ellipse cx="119" cy="374" rx="61" ry="7" fill="#0005"/><g fill="#29382e" stroke="#53654f" strokeWidth="1.5"><ellipse cx="119" cy="34" rx="22" ry="27"/><path d="M105 59 L103 67 Q70 65 59 82 L44 145 L29 207 Q33 225 43 214 L68 159 L80 112 L88 172 L78 217 L84 289 L85 351 L79 364 L110 364 L116 290 L119 239 L122 290 L128 364 L159 364 L153 351 L154 289 L160 217 L150 172 L158 112 L170 159 L195 214 Q205 225 209 207 L194 145 L179 82 Q168 65 135 67 L133 59"/></g>{muscleGroups.filter(m=>m.side===side).map(m=><path key={m.id} d={shapes[m.id]} role="button" tabIndex={0} aria-label={'جست‌وجوی حرکات '+m.name} aria-pressed={selected?.id===m.id} className={'muscle-region '+(selected?.id===m.id?'is-active':'')} onClick={()=>choose(m)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(m)}}}><title>{m.name}</title></path>)}</svg><span className="muscle-caption">نقشهٔ شماتیک عضلات</span></div><div className="muscle-options"><div className="muscle-buttons">{muscleGroups.map(m=><button type="button" key={m.id} aria-pressed={selected?.id===m.id} onClick={()=>choose(m)}>{m.name}</button>)}</div><div className="muscle-selection" aria-live="polite">{selected?<><small>عضلهٔ انتخاب‌شده</small><h3>{selected.name} <bdi>{selected.english}</bdi></h3><p>نام یک حرکت را انتخاب کن تا جست‌وجو دقیق‌تر شود:</p><div className="muscle-moves">{selected.moves.map(move=><button key={move} type="button" onClick={()=>onSearch(move)}>{move} ←</button>)}</div></>:<p>برای شروع یکی از ۱۳ گروه عضلانی را انتخاب کن.</p>}</div></div></div></section>
}
