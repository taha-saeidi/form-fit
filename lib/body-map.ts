export const muscleGroups = [
 {id:'chest',name:'سینه',english:'chest',side:'front',muscles:['chest'],moves:['پرس سینه دمبل','فلای سینه']},
 {id:'shoulders',name:'سرشانه',english:'shoulders',side:'front',muscles:['shoulders'],moves:['پرس سرشانه دمبل','نشر جانب']},
 {id:'biceps',name:'جلو بازو',english:'biceps',side:'front',muscles:['biceps'],moves:['جلو بازو دمبل','جلو بازو چکشی']},
 {id:'forearms',name:'ساعد',english:'forearms',side:'front',muscles:['forearms'],moves:['ساعد دمبل','ساعد هالتر']},
 {id:'abs',name:'شکم',english:'abdominals',side:'front',muscles:['abdominals'],moves:['کرانچ','پلانک']},
 {id:'quads',name:'چهارسر ران',english:'quadriceps',side:'front',muscles:['quadriceps'],moves:['جلو پا دستگاه','اسکوات']},
 {id:'traps',name:'کول',english:'traps',side:'back',muscles:['traps'],moves:['شراگ دمبل','شراگ هالتر']},
 {id:'back',name:'پشت و زیربغل',english:'back',side:'back',muscles:['lats','middle back'],moves:['لت سیمکش','قایقی سیمکش']},
 {id:'triceps',name:'پشت بازو',english:'triceps',side:'back',muscles:['triceps'],moves:['پشت بازو سیمکش','پشت بازو دمبل']},
 {id:'lowerback',name:'پایین کمر',english:'lower back',side:'back',muscles:['lower back'],moves:['فیله کمر','برد داگ']},
 {id:'glutes',name:'باسن',english:'glutes',side:'back',muscles:['glutes'],moves:['پل باسن','هیپ تراست']},
 {id:'hamstrings',name:'پشت پا',english:'hamstrings',side:'back',muscles:['hamstrings'],moves:['پشت پا دستگاه','ددلیفت رومانیایی']},
 {id:'calves',name:'ساق پا',english:'calves',side:'back',muscles:['calves'],moves:['ساق پا ایستاده','ساق پا نشسته']},
] as const;
export function muscleForQuery(q:string){const n=q.trim().toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک');return muscleGroups.find(m=>m.name===n||m.english===n)}
