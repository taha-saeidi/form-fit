import {requireChatGPTUser} from '../chatgpt-auth';
import {isAdmin} from '@/lib/admin';
import AdminPanel from './panel';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await requireChatGPTUser('/admin');
 if(!isAdmin(user))return <main className="admin-shell"><div className="panel"><h1>دسترسی محدود</h1><p>این بخش فقط برای مدیر فرم‌فیت در دسترس است.</p><a className="primary" href="/">بازگشت به برنامه</a></div></main>;
 return <AdminPanel/>;
}
