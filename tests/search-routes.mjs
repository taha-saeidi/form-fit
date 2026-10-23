import ts from 'typescript';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleFrom=s=>import('data:text/javascript;base64,'+Buffer.from(compile(s)).toString('base64'));
// Reproduce the production failure: Cache API operations are unavailable.
Object.defineProperty(globalThis,'caches',{configurable:true,get(){throw Error('Cache API unavailable');}});
globalThis.routeMocks={guideFor:()=>({title:'راهنما'}),sourceNames:{mrgym:'مسترجیم'},searchMany:async()=>({videos:[{id:'curl'}],sources:[{status:'ok'}]}),sourceDetail:async()=>({media:'https://video.mrgym.ir/test.mp4'}),persianDetail:async()=>({embed:'https://www.aparat.com/test'})};
const config=await moduleFrom(fs.readFileSync('lib/source-config.ts','utf8'));Object.assign(globalThis.routeMocks,config,{foreignDetail:async()=>({images:['image']})});
async function route(path){return moduleFrom(fs.readFileSync(path,'utf8').replace(/^import .*;$/gm,'')+'\nconst {guideFor,sourceNames,searchMany,sourceDetail,persianDetail,foreignSources,foreignDetail,validSourceId}=globalThis.routeMocks;');}
const search=await route('app/api/search/route.ts');
let response=await search.GET(new Request('https://test/api/search?q=پرس&provider=all'));
assert.equal(response.status,200);assert.equal((await response.json()).videos[0].id,'curl');
assert.equal((await search.GET(new Request('https://test/api/search?q=پرس&provider=bad'))).status,400);
const source=await route('app/api/source/route.ts');
response=await source.GET(new Request('https://test/api/source?slug=curl&provider=mrgym'));
assert.equal(response.status,200);assert.ok((await response.json()).media);
response=await source.GET(new Request('https://test/api/source?slug=123&provider=fitclub'));
assert.equal(response.status,200);assert.ok((await response.json()).embed);
globalThis.routeMocks.searchMany=async()=>{throw Error('upstream outage')};
const failed=await moduleFrom(fs.readFileSync('app/api/search/route.ts','utf8').replace(/^import .*;$/gm,'')+'\nconst {guideFor,sourceNames,searchMany}=globalThis.routeMocks;\n// failure case');
response=await failed.GET(new Request('https://test/api/search?q=پرس'));assert.equal(response.status,502);assert.match((await response.json()).error,/جست‌وجو/);
const client=await moduleFrom(fs.readFileSync('lib/api-client.ts','utf8'));
for(const body of ['', '<html>Server error</html>', '{"unfinished":', 'null']){
 try{await client.readApiJson(new Response(body,{status:500}));assert.fail('must reject');}catch(e){assert.match(client.apiErrorMessage(e),/ارتباط/);assert.ok(!client.apiErrorMessage(e).includes('JSON'));}
}
assert.match(client.apiErrorMessage(new TypeError('Failed to fetch')),/ارتباط/);
assert.deepEqual(await client.readApiJson(Response.json({videos:[]})),{videos:[]});
console.log('PASS: search and video routes work without Cache API; upstream errors return JSON; empty/HTML/malformed responses and network errors show Persian messages');
