import data from './data/mrgym-index.json';import {normalizeExercise} from './exercise-query';
const groups=new Map(data.items.filter(r=>r[3]===0).map(r=>[normalizeExercise(String(r[0])),String(r[5]||'نامشخص')]));
export const muscleFor=(name:string)=>groups.get(normalizeExercise(name))||'نامشخص';
