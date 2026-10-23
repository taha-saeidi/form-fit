import {getDb} from '@/db';
import {users} from '@/db/schema';
import type {ChatGPTUser} from '@/app/chatgpt-auth';
export async function recordUser(user:ChatGPTUser){
 const now=new Date().toISOString();
 await getDb().insert(users).values({id:user.userId,email:user.email,name:user.fullName||'ورزشکار',firstSeen:now,lastSeen:now}).onConflictDoUpdate({target:users.id,set:{email:user.email,name:user.fullName||'ورزشکار',lastSeen:now}});
}
