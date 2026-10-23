import {getChatGPTUser} from './chatgpt-auth';
import {isAdmin} from '@/lib/admin';
import {recordUser} from '@/lib/users';
import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();if(user){try{await recordUser(user)}catch{console.error("User registration unavailable")}}return <Dashboard user={user?{name:user.fullName||'ورزشکار',email:user.email,isAdmin:isAdmin(user)}:null}/>}
