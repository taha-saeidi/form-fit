import type {ChatGPTUser} from '@/app/chatgpt-auth';
export function isAdmin(user:ChatGPTUser|null):boolean{return !!user?.userId&&user.role==='admin'}
