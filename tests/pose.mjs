import ts from 'typescript';import fs from 'node:fs';import assert from 'node:assert/strict';
const src=ts.transpileModule(fs.readFileSync('lib/pose-analysis.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {angle,analyze}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
assert.equal(Math.round(angle({x:0,y:1},{x:0,y:0},{x:1,y:0})),90);
assert.equal(Math.round(angle({x:0,y:1},{x:0,y:0},{x:0,y:-1})),180);
const p=Array.from({length:33},()=>({x:.5,y:.5,visibility:0}));
assert.equal(analyze(p,'curl',640,480).state,'unknown');
for(const [i,x,y] of [[11,.35,.25],[12,.65,.25],[13,.35,.45],[14,.65,.45],[15,.35,.65],[16,.65,.65],[23,.38,.7],[24,.62,.7]])p[i]={x,y,visibility:.98};
assert.equal(analyze(p,'curl',640,480).state,'tracking');
p[13].x=.1;assert.equal(analyze(p,'curl',640,480).state,'warning');p[13].visibility=.2;assert.equal(analyze(p,'curl',640,480).state,'unknown');
console.log('PASS: angle geometry, low confidence suppression, frontal curl tracking and deviation warning');
// New modes suppress uncertain tracking and only warn for explicitly supported checks.
const empty=Array.from({length:33},()=>({x:.5,y:.5,visibility:0}));
for(const mode of ['hammer','lateral','press','pushup','lunge','wallsit','bridge'])assert.equal(analyze(empty,mode,640,480).state,'unknown');
p[13]={x:.35,y:.45,visibility:.98};
for(const mode of ['hammer','lateral','press']){assert.equal(analyze(p,mode,640,480).state,'tracking');const tilted=p.map(v=>({...v}));tilted[23].x=.7;tilted[24].x=.9;assert.equal(analyze(tilted,mode,640,480).state,'warning');}
const side=empty.map(v=>({...v}));for(const [i,x,y] of [[11,.2,.3],[12,.21,.3],[13,.2,.5],[15,.3,.5],[23,.45,.35],[25,.65,.39],[27,.85,.43]])side[i]={x,y,visibility:.99};
assert.equal(analyze(side,'pushup',640,480).state,'tracking');side[13].visibility=.1;assert.equal(analyze(side,'pushup',640,480).state,'unknown');
for(const mode of ['lunge','wallsit','bridge']){const r=analyze(side,mode,640,480);assert.equal(r.state,'tracking');assert.ok(Number.isFinite(r.angle));}
assert.equal(analyze(side,'unsupported',640,480).state,'unknown');
console.log('PASS: seven added camera modes, confidence gates, supported posture warnings and angle-only modes');
