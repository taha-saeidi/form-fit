import handler from 'vinext/server/fetch-handler';
export default {
 async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
  const id=crypto.randomUUID();
  try{
   if(!['GET','HEAD'].includes(request.method)&&request.body){
    const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>262144){await reader.cancel();return Response.json({error:'حجم درخواست بیش از حد مجاز است.'},{status:413})}chunks.push(value)}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}request=new Request(request,{body:bytes});
   }
   return await handler.fetch(request,env,ctx);
  }catch(error){console.error(JSON.stringify({event:'request_failed',requestId:id,path:new URL(request.url).pathname,errorType:error instanceof Error?error.name:'Unknown'}));return Response.json({error:'خطایی در سرور رخ داد؛ دوباره تلاش کنید.',requestId:id},{status:503,headers:{'Cache-Control':'no-store'}})}
 },
 async scheduled(_event:ScheduledController,env:Cloudflare.Env){const now=Date.now();await env.DB.batch([env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at < ?').bind(now),env.DB.prepare('DELETE FROM oauth_states WHERE expires_at < ?').bind(now),env.DB.prepare('DELETE FROM auth_limits WHERE reset_at < ?').bind(now)])}
};
