// Compatibility name retained for application imports; identity comes only from local sessions.
import {cookies} from 'next/headers';import {redirect} from 'next/navigation';import {userFromSession,sessionCookie,safeReturn} from '@/lib/local-auth.mjs';
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null;role?:string};
export async function getChatGPTUser():Promise<ChatGPTUser|null>{const jar=await cookies();const user=await userFromSession(jar.get(sessionCookie)?.value);return user?{userId:String(user.userId),email:String(user.email),fullName:String(user.fullName),displayName:String(user.fullName),role:String(user.role)}:null}
export async function requireChatGPTUser(returnTo:string){const u=await getChatGPTUser();if(!u)redirect(chatGPTSignInPath(returnTo));return u}
export const chatGPTSignInPath=(returnTo='/')=>'/signin?returnTo='+encodeURIComponent(safeReturn(returnTo));
export const chatGPTSignOutPath=()=>'/signout';
