const fallback='ارتباط با سرور کامل نشد؛ لطفاً دوباره امتحان کنید.';
class ApiError extends Error {}
export function apiErrorMessage(error:unknown):string{
 return error instanceof ApiError?error.message:fallback;
}
export async function readApiJson(response:Response):Promise<any>{
 let data:any;
 try{data=await response.json();}catch{throw new ApiError(fallback);}
 if(!data||typeof data!=='object'||Array.isArray(data))throw new ApiError(fallback);
 if(!response.ok){
  const message=typeof data.error==='string'&&/[\u0600-\u06ff]/.test(data.error)&&data.error.length<250?data.error:fallback;
  throw new ApiError(message);
 }
 return data;
}
