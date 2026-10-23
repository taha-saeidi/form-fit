// D1 allows at most 100 bound parameters per statement; `exercises` has 10 columns, so insert at most 9 rows at once.
export const chunk=<T,>(rows:T[],size=9):T[][]=>Array.from({length:Math.ceil(rows.length/size)},(_,i)=>rows.slice(i*size,(i+1)*size));
